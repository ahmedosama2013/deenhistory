// Registers the service worker and adds an "Install App" item to the sidebar.
(function () {
  const isNativeApp = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  const isWeb = location.protocol === 'https:' || location.hostname === 'localhost';

  // Skip inside the Android APK (files are already bundled there)
  if (isNativeApp || !isWeb) return;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch((err) => console.warn('SW registration failed:', err));
    });
  }

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (isStandalone) return; // already installed

  let deferredPrompt = null;
  let installItem = null;

  function addInstallItem(label, onClick) {
    if (installItem) installItem.remove();
    const nav = document.querySelector('#global-sidebar .nav-group');
    if (!nav) return;
    installItem = document.createElement('a');
    installItem.className = 'nav-item';
    installItem.textContent = label;
    installItem.style.cursor = 'pointer';
    installItem.addEventListener('click', onClick);
    nav.insertBefore(installItem, nav.firstChild);
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    addInstallItem('Install App', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      if (installItem) installItem.remove();
    });
  });

  window.addEventListener('appinstalled', () => {
    if (installItem) installItem.remove();
    deferredPrompt = null;
  });

  // iOS Safari has no install prompt, so show instructions instead
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (isIOS) {
    window.addEventListener('DOMContentLoaded', () => {
      addInstallItem('Install App', () => {
        alert('To install: tap the Share button in Safari, then choose "Add to Home Screen".');
      });
    });
  }
})();
