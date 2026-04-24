/* ============================================================
   FADED Barbershop — Consent helper
   No carga cookies analíticas/publicitarias sin consentimiento
   ============================================================ */

'use strict';

(function initConsentHelper() {
  const STORAGE_KEY = 'faded_cookie_preferences';

  function readPreferences() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return typeof parsed === 'object' && parsed ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function writePreferences(next) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next || {}));
    } catch (_) {
      /* Sin bloqueo: si localStorage falla, no cargamos tracking */
    }
  }

  function hasConsent(type) {
    return readPreferences()[type] === true;
  }

  function loadScript(src, consentType, attrs = {}) {
    if (consentType && !hasConsent(consentType)) {
      return null;
    }

    const existing = document.querySelector(`script[data-consent-src="${src}"]`);
    if (existing) {
      return existing;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = attrs.async !== false;
    script.defer = attrs.defer === true;
    script.dataset.consentSrc = src;

    Object.entries(attrs).forEach(([key, value]) => {
      if (['async', 'defer'].includes(key) || value == null) {
        return;
      }
      script.setAttribute(key, String(value));
    });

    document.head.appendChild(script);
    return script;
  }

  window.FadedConsent = {
    key: STORAGE_KEY,
    getPreferences: readPreferences,
    setPreferences: writePreferences,
    hasConsent,
    loadScript,
  };
})();
