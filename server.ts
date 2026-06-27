import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json());

  // Logging middleware (only log API requests to prevent development assets from cluttering the logs)
  app.use((req, res, next) => {
    if (req.url.startsWith("/api")) {
      console.log(`[Backend Server] ${req.method} ${req.url}`);
    }
    next();
  });

  // CORS headers just in case
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    next();
  });

  // 1. Rscripts.net proxy endpoint
  app.get("/api/rscripts/scripts", async (req, res) => {
    const page = req.query.page || "1";
    const orderBy = req.query.orderBy || "date";
    const sort = req.query.sort || "desc";
    const q = req.query.q || "";

    const url = new URL("https://rscripts.net/api/v2/scripts");
    url.searchParams.set("page", page.toString());
    url.searchParams.set("orderBy", orderBy.toString());
    url.searchParams.set("sort", sort.toString());
    if (q) {
      url.searchParams.set("q", q.toString());
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json"
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const text = await response.text();
        res.status(response.status).send(text);
        return;
      }

      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      console.error(`[Proxy Error] Rscripts failed:`, err.message);
      res.status(502).json({ error: "Failed to connect to Rscripts.net API", details: err.message });
    }
  });

  // 2. ScriptBlox proxy endpoint
  app.get("/api/scriptblox/fetch", async (req, res) => {
    const page = req.query.page || "1";
    const max = req.query.max || "20";
    const q = req.query.q || "";
    const verified = req.query.verified;
    const patched = req.query.patched;
    const key = req.query.key;
    const trending = req.query.trending;
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order || "desc";

    const isSearch = !!q;
    const endpoint = isSearch ? "/script/search" : "/script/fetch";
    const url = new URL(`https://scriptblox.com/api${endpoint}`);

    url.searchParams.set("page", page.toString());
    url.searchParams.set("max", max.toString());
    if (isSearch) {
      url.searchParams.set("q", q.toString());
    }
    if (verified !== undefined) url.searchParams.set("verified", verified.toString());
    if (patched !== undefined) url.searchParams.set("patched", patched.toString());
    if (key !== undefined) url.searchParams.set("key", key.toString());
    if (trending) url.searchParams.set("trending", "true");
    url.searchParams.set("sortBy", sortBy.toString());
    url.searchParams.set("order", order.toString());

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json"
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const text = await response.text();
        res.status(response.status).send(text);
        return;
      }

      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      console.error(`[Proxy Error] ScriptBlox failed:`, err.message);
      res.status(502).json({ error: "Failed to connect to ScriptBlox.com API", details: err.message });
    }
  });

  // 3. Vite development middleware / Static production serve
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[Backend Server] Vite middleware loaded in development mode.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("[Backend Server] Serving static files in production mode.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Backend Server] Server bound and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
