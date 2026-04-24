/* ============================================================
   FADED Barbershop — Analytics & Tracking
   IDs configurables desde /admin → Configuración → Analytics
   Meta Pixel y Google Analytics 4 con consentimiento RGPD
   ============================================================ */
'use strict';

(function FadedAnalytics() {
  /* IDs por defecto — se sobreescriben con los valores de config.json
     si el admin los cambia desde /admin (sección Configuración) */
  var GA_ID    = 'G-J77W6XTWVN';
  var PIXEL_ID = '954925092429846';

  /* ── 1. Google Analytics 4 ── */
  function loadGA4() {
    if (window._fadedGA4 || !GA_ID) return;
    window._fadedGA4 = true;

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
  }

  /* ── 2. Meta Pixel ── */
  function loadPixel() {
    if (window._fadedPixel || !PIXEL_ID) return;
    window._fadedPixel = true;

    /* eslint-disable */
    !function(f,b,e,v,n,t,s){
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s);
    }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */

    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  /* ── 3. Aplicar preferencias ── */
  function applyConsent(prefs) {
    if (prefs.analytics) loadGA4();
    if (prefs.marketing) loadPixel();
  }

  /* ── 4. Guardar y aplicar ── */
  function acceptAll() {
    var prefs = { analytics: true, marketing: true };
    if (window.FadedConsent) window.FadedConsent.setPreferences(prefs);
    applyConsent(prefs);
    hideBanner();
  }

  function acceptEssentials() {
    var prefs = { analytics: false, marketing: false };
    if (window.FadedConsent) window.FadedConsent.setPreferences(prefs);
    hideBanner();
  }

  /* ── 5. Banner de cookies (RGPD) ── */
  function hideBanner() {
    var b = document.getElementById('faded-cookie-banner');
    if (b) {
      b.style.transition = 'opacity .3s, transform .3s';
      b.style.opacity = '0';
      b.style.transform = 'translateY(100%)';
      setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 350);
    }
  }

  function injectBannerStyles() {
    if (document.getElementById('faded-cookie-banner-styles')) return;
    var style = document.createElement('style');
    style.id = 'faded-cookie-banner-styles';
    style.textContent = [
      '#faded-cookie-banner{',
        'position:fixed;bottom:0;left:0;right:0;z-index:9999;',
        'background:#0a0a0a;border-top:1px solid #c9a84c;',
        'padding:1rem 1.5rem;',
        'animation:fcb-up .35s ease;',
      '}',
      '@keyframes fcb-up{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}',
      '.fcb-inner{max-width:900px;margin:0 auto;display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap;}',
      '.fcb-text{color:#bbb;font-size:.83rem;line-height:1.55;margin:0;flex:1;min-width:220px;font-family:inherit;}',
      '.fcb-link{color:#c9a84c;text-decoration:none;}',
      '.fcb-link:hover{text-decoration:underline;}',
      '.fcb-actions{display:flex;gap:.75rem;flex-shrink:0;flex-wrap:wrap;}',
      '.fcb-btn{padding:.55rem 1.25rem;border:none;border-radius:2px;cursor:pointer;',
        'font-size:.78rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;',
        'transition:opacity .2s;font-family:inherit;}',
      '.fcb-btn:hover{opacity:.82;}',
      '.fcb-btn--accept{background:#c9a84c;color:#000;}',
      '.fcb-btn--reject{background:transparent;color:#888;border:1px solid #444;}',
      '@media(max-width:600px){',
        '.fcb-inner{flex-direction:column;align-items:flex-start;gap:.9rem;}',
        '.fcb-actions{width:100%;}',
        '.fcb-btn{flex:1;padding:.7rem .5rem;font-size:.75rem;}',
      '}',
    ].join('');
    document.head.appendChild(style);
  }

  function showBanner() {
    if (document.getElementById('faded-cookie-banner')) return;
    injectBannerStyles();

    var banner = document.createElement('div');
    banner.id = 'faded-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Gestión de cookies');
    banner.innerHTML =
      '<div class="fcb-inner">' +
        '<p class="fcb-text">' +
          'Usamos cookies propias y de terceros (Google Analytics, Meta Pixel) para mejorar la ' +
          'experiencia y analizar el tráfico. Puedes aceptar todas o usar solo las esenciales. ' +
          '<a href="/politicas" class="fcb-link">Más información →</a>' +
        '</p>' +
        '<div class="fcb-actions">' +
          '<button id="fcb-accept-all" class="fcb-btn fcb-btn--accept">Aceptar todo</button>' +
          '<button id="fcb-accept-ess" class="fcb-btn fcb-btn--reject">Solo esenciales</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(banner);
    document.getElementById('fcb-accept-all').addEventListener('click', acceptAll);
    document.getElementById('fcb-accept-ess').addEventListener('click', acceptEssentials);
  }

  /* ── 6. Recibir IDs actualizados desde config.json (vía script.js) ──
     script.js llama a window.FadedAnalytics.applyConfig(config) después
     de cargar _data/config.json, permitiendo cambiar los IDs desde /admin
     sin tocar el código. */
  function applyConfig(config) {
    var changed = false;

    if (config.ga4_id && config.ga4_id !== GA_ID) {
      GA_ID = config.ga4_id;
      window._fadedGA4 = false; /* Resetear para permitir recargar con nuevo ID */
      changed = true;
    }
    if (config.meta_pixel_id && config.meta_pixel_id !== PIXEL_ID) {
      PIXEL_ID = config.meta_pixel_id;
      window._fadedPixel = false;
      changed = true;
    }

    /* Si el consentimiento ya estaba dado y los IDs cambiaron, cargar ahora */
    if (changed) {
      var prefs = window.FadedConsent ? window.FadedConsent.getPreferences() : {};
      var hasDecided = ('analytics' in prefs) || ('marketing' in prefs);
      if (hasDecided) applyConsent(prefs);
    }
  }

  /* ── 7. Tracking de conversiones SumUp ── */
  function trackSumUpClick(productName, price) {
    if (window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'EUR',
        value: price,
        items: [{ item_name: productName, price: price, quantity: 1 }],
      });
    }
    if (window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        currency: 'EUR',
        value: price,
        content_name: productName,
        content_type: 'product',
      });
    }
  }

  function trackServiceClick(serviceName, price) {
    if (window.gtag) {
      window.gtag('event', 'begin_checkout', {
        currency: 'EUR',
        value: price,
        items: [{ item_name: serviceName, price: price, item_category: 'Servicio', quantity: 1 }],
      });
    }
    if (window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        currency: 'EUR',
        value: price,
        content_name: serviceName,
        content_type: 'service',
      });
    }
  }

  /* API pública */
  window.FadedTracking = {
    trackSumUpClick: trackSumUpClick,
    trackServiceClick: trackServiceClick,
  };

  /* API interna (usada por script.js) */
  window.FadedAnalytics = {
    applyConfig: applyConfig,
  };

  /* ── 8. Inicialización ── */
  function init() {
    var prefs = window.FadedConsent ? window.FadedConsent.getPreferences() : {};
    var hasDecided = ('analytics' in prefs) || ('marketing' in prefs);

    if (hasDecided) {
      applyConsent(prefs);
    } else {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showBanner);
      } else {
        showBanner();
      }
    }
  }

  init();
})();
