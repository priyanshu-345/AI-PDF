import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  Share2,
  CheckCircle2,
  Sparkles,
  Zap,
  Globe,
  Monitor,
  Apple,
  Layers,
} from 'lucide-react';

export const InstallWebAppSection: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop'>('android');

  useEffect(() => {
    // Detect OS
    const userAgent = navigator.userAgent || navigator.vendor;
    if (/android/i.test(userAgent)) {
      setPlatform('android');
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setPlatform('ios');
    } else {
      setPlatform('desktop');
    }

    // Check if already in standalone display mode
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstalled(true);
    }

    // Listen for PWA beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Trigger user guidance
      if (platform === 'ios') {
        alert("To install on iPhone/iPad: Tap the 'Share' button (⎙) in Safari, then select 'Add to Home Screen' (+).");
      } else if (platform === 'android') {
        alert("To install on Android: Tap the 3 dots menu (⋮) in Chrome, then select 'Install app' or 'Add to Home Screen'.");
      } else {
        alert("To install on PC/Mac: Click the Install icon in the right side of the Chrome/Edge address bar.");
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-white via-[#FAF9F9] to-maroon-50/40 border-2 border-maroon-100 rounded-3xl p-6 sm:p-10 shadow-card relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-radial from-maroon-100/50 to-transparent rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left: Info */}
        <div className="space-y-4 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center space-x-2 bg-maroon-100/70 text-maroon-800 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            <Smartphone className="w-3.5 h-3.5 text-maroon-700" />
            <span>Mobile Web App (PWA) Version</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
            Install AI PDF Studio on Your Smartphone or Desktop
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Use the complete suite of PDF tools, 36 conversion formats, and AI document processing anywhere on your phone. Works fully offline, launches instantly from your home screen, and uses zero store memory.
          </p>

          {/* Quick Badges */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1 text-xs font-bold text-slate-700">
            <div className="flex items-center space-x-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Instant Launch</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Offline Ready</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-maroon-700" />
              <span>Full Privacy</span>
            </div>
          </div>
        </div>

        {/* Right: Installation Action Card */}
        <div className="w-full md:w-80 bg-white border border-[#EAE5E5] rounded-3xl p-6 shadow-card space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-maroon-800 to-maroon-600 flex items-center justify-center mx-auto shadow-maroon text-white">
            <Smartphone className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-base font-black text-slate-900">
              {isInstalled ? 'App Installed!' : 'One-Tap Web App'}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Optimized for Android, iOS & Desktop
            </p>
          </div>

          <button
            onClick={handleInstallClick}
            className="w-full bg-maroon-700 hover:bg-maroon-800 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-sm transition-transform active:scale-95 flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>{isInstalled ? 'Open App Workspace' : 'Install Web App on Device'}</span>
          </button>

          {/* Platform Tab Helper */}
          <div className="pt-2 border-t border-slate-100 text-left">
            <p className="text-[11px] font-bold text-slate-700 mb-1.5 text-center">
              How to add to Home Screen:
            </p>
            <div className="bg-[#FAF9F9] border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 font-medium space-y-1">
              {platform === 'android' && (
                <p>
                  📱 <strong>Android:</strong> Tap <strong>⋮ (3 dots)</strong> in Chrome & select <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.
                </p>
              )}
              {platform === 'ios' && (
                <p>
                  🍏 <strong>iPhone:</strong> Tap <strong>Share (⎙)</strong> in Safari & select <strong>"Add to Home Screen"</strong>.
                </p>
              )}
              {platform === 'desktop' && (
                <p>
                  💻 <strong>Desktop:</strong> Click the <strong>Install Icon (⊞)</strong> in your browser address bar.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

