import React, { useState, useEffect } from 'react';
import { 
  Key, ShieldCheck, RefreshCw, AlertCircle, Sparkles 
} from 'lucide-react';
import { AppTheme, UserSettings } from '../types';

interface AboutViewProps {
  theme: AppTheme;
  settings: UserSettings;
}

export default function AboutView({ theme, settings }: AboutViewProps) {
  // Initialize from localStorage or fallback
  const [licenseKey, setLicenseKey] = useState(() => {
    return localStorage.getItem('incognito_license_key') || '';
  });
  const [isPremium, setIsPremium] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Simple premium key check rule: contains "PREM" or "PREMIUM" or "INCOGNITO" or length > 12
  const checkPremiumStatus = (key: string) => {
    const k = key.trim().toUpperCase();
    return k.includes('PREM') || k.includes('INCOGNITO') || k.length >= 16;
  };

  useEffect(() => {
    setIsPremium(checkPremiumStatus(licenseKey));
  }, [licenseKey]);

  const handleValidate = () => {
    if (!licenseKey.trim()) {
      setMessage({ type: 'info', text: 'Cleared key. Reverted to Free Tier.' });
      localStorage.removeItem('incognito_license_key');
      setIsPremium(false);
      return;
    }

    setIsValidating(true);
    setMessage(null);

    // Beautiful simulated validation latency
    setTimeout(() => {
      setIsValidating(false);
      const premium = checkPremiumStatus(licenseKey);
      if (premium) {
        setIsPremium(true);
        localStorage.setItem('incognito_license_key', licenseKey);
        setMessage({ 
          type: 'success', 
          text: 'License key successfully verified! Premium sandbox activated.' 
        });
      } else {
        setIsPremium(false);
        setMessage({ 
          type: 'error', 
          text: 'Invalid key format or key has expired. Try "INCOGNITO-PREMIUM" for testing.' 
        });
      }
    }, 1200);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center font-sans">
      <div 
        className="w-full max-w-xl border p-8 rounded-2xl space-y-6 shadow-2xl relative overflow-hidden" 
        style={{ backgroundColor: theme.cardBg, borderColor: theme.borderColor }}
      >
        {/* Subtle decorative background glow */}
        <div 
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-2xl pointer-events-none"
          style={{ backgroundColor: theme.accent }}
        />

        {/* Title & Tier Badge */}
        <div className="flex items-center justify-between border-b pb-5" style={{ borderColor: theme.borderColor }}>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800" style={{ color: theme.accent }}>
              <Key className="w-5 h-5 shrink-0" />
            </div>
            <div className="text-left">
              <h1 className="text-base font-extrabold tracking-tight uppercase" style={{ color: theme.textMain }}>
                Key Management
              </h1>
              <p className="text-[10px] font-mono text-zinc-500">License verification & environment tier</p>
            </div>
          </div>

          <div className="flex items-center shrink-0">
            {isPremium ? (
              <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shadow-sm shadow-emerald-500/5">
                <Sparkles size={11} className="animate-pulse" />
                Premium Tier
              </span>
            ) : (
              <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase bg-zinc-900 text-zinc-400 border border-zinc-800">
                Free Tier
              </span>
            )}
          </div>
        </div>

        {/* Form input */}
        <div className="space-y-2.5">
          <label className="text-[9px] font-mono font-bold uppercase tracking-widest block text-zinc-500 text-left">
            Paste your key here (Format: INCO-XXXX-XXXX-XXXX-XXXX)
          </label>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Key size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="license-key-input"
                type="text"
                placeholder="INCO-XXXX-XXXX-XXXX-XXXX"
                value={licenseKey}
                onChange={(e) => {
                  setLicenseKey(e.target.value);
                  if (message) setMessage(null);
                }}
                className="w-full py-2.5 pl-10 pr-4 bg-black/40 border border-zinc-850 rounded-xl text-xs font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition"
                style={{ borderColor: theme.borderColor }}
              />
            </div>
            <button
              id="activate-license-btn"
              onClick={handleValidate}
              disabled={isValidating}
              className="px-5 py-2.5 rounded-xl text-xs font-bold font-sans transition uppercase cursor-pointer shrink-0 flex items-center justify-center space-x-1.5 shadow-md active:scale-95 duration-100"
              style={{
                backgroundColor: theme.accent,
                color: theme.isLight ? '#ffffff' : '#000000'
              }}
            >
              {isValidating ? (
                <RefreshCw size={12} className="animate-spin" />
              ) : (
                <ShieldCheck size={12} />
              )}
              <span>{isValidating ? 'Activating...' : 'Activate'}</span>
            </button>
          </div>
        </div>

        {/* Validation Feedback Messages */}
        {message && (
          <div 
            className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start space-x-2.5 transition-all duration-200 text-left ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : message.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300'
            }`}
          >
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <p className="font-mono text-[11px] font-medium leading-relaxed">{message.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}
