import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return (
      <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] bg-emerald-900/40 text-emerald-300 border border-emerald-700/50">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        PWA Active
      </span>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded bg-blue-700 hover:bg-blue-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs transition"
        title="Install AegisHMI as a standalone PWA on this workstation"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Install HMI App
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded border border-gray-400 px-2 py-1 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
        >
          Install on iPad
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-lg bg-white dark:bg-gray-900 p-6 shadow-2xl border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100">
              <h3 className="text-base font-bold">Install AegisHMI on iPad / iPhone</h3>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                1. Tap the <strong>Share</strong> button (box with upward arrow) in the Safari toolbar.<br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
                3. Launch the app directly from your home screen for full-screen industrial console mode.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded bg-gray-200 dark:bg-gray-800 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      onClick={() => alert('To install, use your browser menu and choose "Install AegisHMI" or "Add to Home Screen".')}
      className="hidden sm:flex items-center gap-1.5 rounded bg-slate-700 hover:bg-slate-600 px-2.5 py-1 text-xs font-bold text-gray-200 border border-slate-600 transition"
      title="Install as Progressive Web App"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      PWA Install
    </button>
  );
};
