import { useState, useEffect, useCallback } from 'react';
import { isPWA } from '@/utils/helpers';

/* ===== PWA Install Prompt Hook ===== */
interface UseInstallPromptReturn {
  /** Whether the app can be installed (prompt available) */
  canInstall: boolean;
  /** Whether the app is already running as installed PWA */
  isInstalled: boolean;
  /** Show the install prompt (must be triggered by user gesture) */
  promptInstall: () => Promise<void>;
  /** Dismiss the install prompt */
  dismiss: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function useInstallPrompt(): UseInstallPromptReturn {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if already installed
    setIsInstalled(isPWA());

    const handleBeforeInstall = (e: Event) => {
      // Prevent default mini-infobar on mobile
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      deferredPromptRef.current = null;
      setCanInstall(false);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    const prompt = deferredPromptRef.current;
    if (!prompt) return;

    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        setCanInstall(false);
      }
    } catch (err) {
      console.warn('[InstallPrompt] Prompt failed:', err);
    }

    deferredPromptRef.current = null;
  }, []);

  const dismiss = useCallback(() => {
    setCanInstall(false);
    deferredPromptRef.current = null;
  }, []);

  return {
    canInstall,
    isInstalled,
    promptInstall,
    dismiss,
  };
}
