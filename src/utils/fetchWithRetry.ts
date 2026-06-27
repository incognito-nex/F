import { cache } from './cache';

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  cacheKey?: string;
}

// Maps active request URLs to their active promises for request deduplication
const activeRequests = new Map<string, Promise<any>>();

export async function fetchWithRetry<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    timeout = 15000,
    retries = 1,
    cacheKey,
    signal: externalSignal,
    ...restInit
  } = options;

  // 1. Check cache first
  if (cacheKey) {
    const cachedData = cache.get<T>(cacheKey);
    if (cachedData !== null) {
      console.log(`[Cache Hit] Key: ${cacheKey}`);
      return cachedData;
    }
  }

  // 2. Request deduplication: check if identical request is currently in-flight
  const dedupKey = `${url}-${JSON.stringify(restInit)}`;
  if (activeRequests.has(dedupKey)) {
    console.log(`[Request Deduplication] Reusing active promise for: ${url}`);
    return activeRequests.get(dedupKey) as Promise<T>;
  }

  const runFetch = async (): Promise<T> => {
    let attempt = 0;
    const startTime = Date.now();

    while (attempt <= retries) {
      const controller = new AbortController();
      let timeoutId: any;
      
      // If external signal is provided, listen to it to trigger local abort
      const onExternalAbort = () => {
        controller.abort();
      };
      if (externalSignal) {
        externalSignal.addEventListener('abort', onExternalAbort);
      }

      // Handle custom timeout
      timeoutId = setTimeout(() => {
        controller.abort();
      }, timeout);

      try {
        console.log(`[API Request] Fetching URL: ${url} (Attempt ${attempt + 1}/${retries + 1})`);
        
        const response = await fetch(url, {
          ...restInit,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        if (externalSignal) {
          externalSignal.removeEventListener('abort', onExternalAbort);
        }

        const elapsedTime = Date.now() - startTime;
        const responseBodyText = await response.clone().text().catch(() => '');

        // Detailed Logging as per requirement 6
        console.log(
          `%c[API Response Log]\n` +
          `API: ${url.includes('rscripts') ? 'Rscripts.net Proxy' : 'ScriptBlox.com Proxy'}\n` +
          `Request URL: ${url}\n` +
          `HTTP Status: ${response.status}\n` +
          `Timeout: ${timeout}ms\n` +
          `Was Aborted: false\n` +
          `Retry Count: ${attempt}\n` +
          `Response Body: ${responseBodyText.substring(0, 200)}${responseBodyText.length > 200 ? '...' : ''}\n` +
          `Elapsed Time: ${elapsedTime}ms`,
          'color: #00ffcc; font-weight: bold;'
        );

        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status}: ${response.statusText || 'Unknown Error'}`);
        }

        const data = await response.json();

        // Save to cache if successful
        if (cacheKey) {
          cache.set(cacheKey, data);
        }

        return data as T;
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (externalSignal) {
          externalSignal.removeEventListener('abort', onExternalAbort);
        }

        const isAborted = err.name === 'AbortError' || controller.signal.aborted;
        const elapsedTime = Date.now() - startTime;

        if (isAborted) {
          // Normal search cancel or rapid category switching. Log as info, not warning.
          console.log(`[API Request Cancelled] URL: ${url} (took ${elapsedTime}ms)`);
        } else {
          console.warn(
            `%c[API Error Log]\n` +
            `API: ${url.includes('rscripts') ? 'Rscripts.net Proxy' : 'ScriptBlox.com Proxy'}\n` +
            `Request URL: ${url}\n` +
            `HTTP Status: ${err.message || 'Network Failure'}\n` +
            `Timeout: ${timeout}ms\n` +
            `Was Aborted: ${isAborted}\n` +
            `Retry Count: ${attempt}\n` +
            `Response Body: N/A\n` +
            `Elapsed Time: ${elapsedTime}ms`,
            'color: #ff3333; font-weight: bold;'
          );
        }

        // If it was aborted externally (user cancelled search or unmounted), do not retry
        if (isAborted && externalSignal?.aborted) {
          throw err;
        }

        attempt++;
        if (attempt > retries || isAborted) {
          throw err;
        }

        // Exponential backoff before retry (e.g. 500ms * 2^attempt)
        const backoffDelay = 500 * Math.pow(2, attempt);
        console.log(`[API Retry] Retrying in ${backoffDelay}ms after error: ${err.message}`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }

    throw new Error('All fetch attempts failed');
  };

  const promise = runFetch().finally(() => {
    activeRequests.delete(dedupKey);
  });

  activeRequests.set(dedupKey, promise);
  return promise;
}
