'use strict';

let BOOKSY_URL = 'https://booksy.com/es-es/instant-experiences/widget/72058';
const DEFAULT_WHATSAPP_URL = 'https://wa.me/34603147958';
let WHATSAPP_URL = DEFAULT_WHATSAPP_URL;
const DEFAULT_INSTAGRAM_URL = 'https://www.instagram.com/faded_madrid';
const DEFAULT_MAPS_URL = 'https://maps.google.com/?q=Avenida+del+Marqu%C3%A9s+de+Corbera+37+28017+Madrid';
const DEFAULT_MAPS_EMBED_URL = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.2639827962234!2d-3.655646222679194!3d40.425153155124505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd422f5782226aa5%3A0x3b4774988cc92781!2sFADED%20Barbershop!5e0!3m2!1ses!2ses!4v1776785159189!5m2!1ses!2ses';
const DEFAULT_GOOGLE_REVIEW_URL = 'https://g.page/r/CYEnyYyYdEc7EBM/review';
const DEFAULT_PHONE_HREF = 'tel:+34691068660';
const DEFAULT_EMAIL = 'administracion@cuchmequena.com';
const DEFAULT_CONFIG = {
  business_name: 'Faded Barbershop',
  tagline: 'Barbería Premium · Ciudad Lineal · Madrid',
  phone: '+34 691 068 660',
  phone_href: DEFAULT_PHONE_HREF,
  whatsapp: '+34 603 147 958',
  whatsapp_href: DEFAULT_WHATSAPP_URL,
  email: DEFAULT_EMAIL,
  instagram_handle: '@faded_madrid',
  instagram_url: DEFAULT_INSTAGRAM_URL,
  booksy_url: BOOKSY_URL,
  address_street: 'Avenida del Marqués de Corbera, 37',
  address_city: '28017 Madrid (Ciudad Lineal)',
  maps_url: DEFAULT_MAPS_URL,
  maps_embed_url: DEFAULT_MAPS_EMBED_URL,
  google_review_url: DEFAULT_GOOGLE_REVIEW_URL,
  hours_lunes: '11:00 — 21:30',
  hours_martes: '11:00 — 21:30',
  hours_miercoles: '11:00 — 21:30',
  hours_jueves: '11:00 — 21:30',
  hours_viernes: '11:00 — 22:00',
  hours_sabado: '11:00 — 22:00',
  hours_domingo: '12:00 — 21:30',
  reviews_count: '179+',
  reviews_score: '5.0',
  reviews_count_label: '179+',
};
const DEFAULT_NOTICE = {
  active: false,
  type: 'info',
  message: '',
  link_text: '',
  link_url: '',
};
const NOTICE_TYPES = new Set(['info', 'warning', 'alert', 'promo']);

let galleryLightboxItems = [];
let galleryLightboxIndex = 0;
let reviewCounterObserver;

function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function extractPriceValue(price) {
  if (!price) return 0;
  const cleaned = String(price).replace(/[^0-9,.-]/g, '').replace(',', '.');
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? value : 0;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value != null) el.textContent = String(value);
}

function setHTML(id, value) {
  const el = document.getElementById(id);
  if (el && value != null) el.innerHTML = value;
}

function setAttr(id, attr, value) {
  const el = document.getElementById(id);
  if (el && value != null) el.setAttribute(attr, String(value));
}

function setMeta(name, content) {
  if (content == null) return;
  const el = document.querySelector(`meta[name="${name}"]`);
  if (el) el.setAttribute('content', content);
}

function setMetaProp(property, content) {
  if (content == null) return;
  const el = document.querySelector(`meta[property="${property}"]`);
  if (el) el.setAttribute('content', content);
}

async function readJson(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

function safeTrim(value, fallback = '') {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || fallback;
  }
  return fallback;
}

function normalizeDigits(value, fallback) {
  const digits = String(value ?? '').replace(/[^\d]/g, '');
  return digits || fallback;
}

function normalizeConfig(config) {
  const merged = { ...DEFAULT_CONFIG, ...(config || {}) };
  merged.business_name = safeTrim(merged.business_name, DEFAULT_CONFIG.business_name);
  merged.tagline = safeTrim(merged.tagline, DEFAULT_CONFIG.tagline);
  merged.phone = safeTrim(merged.phone, DEFAULT_CONFIG.phone);
  merged.phone_href = safeTrim(merged.phone_href, DEFAULT_CONFIG.phone_href);
  merged.whatsapp = safeTrim(merged.whatsapp, DEFAULT_CONFIG.whatsapp);
  merged.whatsapp_href = safeTrim(merged.whatsapp_href, DEFAULT_CONFIG.whatsapp_href);
  merged.email = safeTrim(merged.email, DEFAULT_CONFIG.email);
  merged.instagram_handle = safeTrim(merged.instagram_handle, DEFAULT_CONFIG.instagram_handle);
  merged.instagram_url = safeTrim(merged.instagram_url, DEFAULT_CONFIG.instagram_url);
  merged.booksy_url = safeTrim(merged.booksy_url, DEFAULT_CONFIG.booksy_url);
  merged.address_street = safeTrim(merged.address_street, DEFAULT_CONFIG.address_street);
  merged.address_city = safeTrim(merged.address_city, DEFAULT_CONFIG.address_city);
  merged.maps_url = safeTrim(merged.maps_url, DEFAULT_CONFIG.maps_url);
  merged.maps_embed_url = safeTrim(merged.maps_embed_url, DEFAULT_CONFIG.maps_embed_url);
  merged.google_review_url = safeTrim(merged.google_review_url, DEFAULT_CONFIG.google_review_url);
  merged.hours_lunes = safeTrim(merged.hours_lunes, DEFAULT_CONFIG.hours_lunes);
  merged.hours_martes = safeTrim(merged.hours_martes, DEFAULT_CONFIG.hours_martes);
  merged.hours_miercoles = safeTrim(merged.hours_miercoles, DEFAULT_CONFIG.hours_miercoles);
  merged.hours_jueves = safeTrim(merged.hours_jueves, DEFAULT_CONFIG.hours_jueves);
  merged.hours_viernes = safeTrim(merged.hours_viernes, DEFAULT_CONFIG.hours_viernes);
  merged.hours_sabado = safeTrim(merged.hours_sabado, DEFAULT_CONFIG.hours_sabado);
  merged.hours_domingo = safeTrim(merged.hours_domingo, DEFAULT_CONFIG.hours_domingo);
  merged.reviews_count = normalizeDigits(merged.reviews_count, DEFAULT_CONFIG.reviews_count);
  merged.reviews_score = safeTrim(merged.reviews_score, DEFAULT_CONFIG.reviews_score);
  merged.reviews_count_label = safeTrim(merged.reviews_count_label, `${merged.reviews_count}+`);
  return merged;
}

function normalizeNotice(notice) {
  const merged = { ...DEFAULT_NOTICE, ...(notice || {}) };
  const type = safeTrim(merged.type, DEFAULT_NOTICE.type);
  const message = safeTrim(merged.message);
  const linkText = safeTrim(merged.link_text);
  const linkUrl = safeTrim(merged.link_url);

  return {
    active: Boolean(merged.active) && Boolean(message),
    type: NOTICE_TYPES.has(type) ? type : DEFAULT_NOTICE.type,
    message,
    link_text: linkText,
    link_url: linkUrl,
  };
}

function slugify(value, fallback = 'item') {
  const normalized = String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || fallback;
}

function normalizeAreaName(area) {
  return safeTrim(area)
    .replace(/^barber[ií]a\s+(en|cerca de)\s+/i, '')
    .replace(/^cerca de\s+/i, '')
    .trim();
}

function isHomePage() {
  return document.body && document.body.dataset.page === 'home';
}

function syncNoticeOffset() {
  const noticeBar = document.getElementById('faded-notice-bar');
  const height = noticeBar ? noticeBar.offsetHeight : 0;
  document.documentElement.style.setProperty('--notice-h', `${height}px`);
  document.body.classList.toggle('has-notice-bar', Boolean(noticeBar && height));
}

function createNoticeItem(notice) {
  const item = document.createElement('div');
  item.className = 'notice-bar__item';

  const pill = document.createElement('span');
  pill.className = 'notice-bar__pill';
  pill.textContent = notice.type === 'promo' ? 'PROMO' : 'AVISO';
  item.appendChild(pill);

  const message = document.createElement('span');
  message.className = 'notice-bar__message';
  message.textContent = notice.message;
  item.appendChild(message);

  if (notice.link_text && notice.link_url) {
    const link = document.createElement('a');
    link.className = 'notice-bar__link';
    link.href = notice.link_url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = notice.link_text;
    item.appendChild(link);
  }

  return item;
}

function renderNoticeBar(noticeData) {
  const notice = normalizeNotice(noticeData);
  const current = document.getElementById('faded-notice-bar');
  if (current) current.remove();

  if (!notice.active) {
    syncNoticeOffset();
    return;
  }

  const bar = document.createElement('aside');
  bar.id = 'faded-notice-bar';
  bar.className = `notice-bar notice-bar--${notice.type}`;
  bar.setAttribute('role', 'status');
  bar.setAttribute('aria-live', 'polite');

  const viewport = document.createElement('div');
  viewport.className = 'notice-bar__viewport';

  const track = document.createElement('div');
  track.className = 'notice-bar__track';
  track.appendChild(createNoticeItem(notice));
  track.appendChild(createNoticeItem(notice));
  viewport.appendChild(track);
  bar.appendChild(viewport);

  document.body.prepend(bar);
  syncNoticeOffset();
}

function updateLocalBusinessSchema(config, services, seo) {
  const schema = document.getElementById('local-business-schema');
  if (!schema) return;

  try {
    const data = JSON.parse(schema.textContent);
    data.name = config.business_name;
    data.url = 'https://www.fadedbarbershopmadrid.com';
    data.telephone = config.phone_href.replace(/^tel:/, '');
    data.description = safeTrim(seo && seo.meta_description, `Barbería premium en Madrid. ${config.reviews_score} estrellas en Booksy con ${config.reviews_count} reseñas.`);
    if (data.address) {
      data.address.streetAddress = config.address_street;
      data.address.addressLocality = config.address_city.replace(/^(\d{5}\s*)?/, '').replace(/\s*\(.+\)$/, '').trim() || 'Madrid';
    }
    data.areaServed = safeTrim(seo && seo.hidden_h3_areas)
      .split(/\s*\|\s*|\s*,\s*/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((area) => normalizeAreaName(area))
      .filter(Boolean)
      .map((area) => ({ '@type': 'City', name: area }));
    if (data.aggregateRating) {
      data.aggregateRating.ratingValue = config.reviews_score;
      data.aggregateRating.reviewCount = config.reviews_count;
    }
    if (Array.isArray(data.sameAs)) {
      data.sameAs = [config.instagram_url, config.booksy_url];
    }
    if (services && Array.isArray(services.categories)) {
      data.hasOfferCatalog = {
        '@type': 'OfferCatalog',
        name: 'Servicios de barbería en Faded Barbershop',
        itemListElement: services.categories.map((category) => ({
          '@type': 'OfferCatalog',
          name: safeTrim(category.title, 'Servicios'),
          itemListElement: (Array.isArray(category.items) ? category.items : []).map((item) => ({
            '@type': 'Offer',
            priceCurrency: 'EUR',
            price: String(extractPriceValue(item.price) || ''),
            availability: 'https://schema.org/InStock',
            itemOffered: {
              '@type': 'Service',
              name: safeTrim(item.name, 'Servicio de barbería'),
              description: safeTrim(item.desc || item.duration || `${safeTrim(category.title)} en Faded Barbershop`),
              serviceType: safeTrim(category.title, 'Barbería'),
              areaServed: 'Madrid',
            },
          })),
        })),
      };
    }
    schema.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    console.warn('No se pudo actualizar el schema LocalBusiness', error);
  }
}

function updateFaqSchema(seo) {
  const schema = document.getElementById('faq-schema');
  if (!schema) return;

  const faqs = Array.isArray(seo && seo.faqs)
    ? seo.faqs.filter((item) => item && safeTrim(item.question) && safeTrim(item.answer))
    : [];

  if (!faqs.length) {
    schema.textContent = '';
    return;
  }

  schema.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: safeTrim(item.question),
      acceptedAnswer: {
        '@type': 'Answer',
        text: safeTrim(item.answer),
      },
    })),
  }, null, 2);
}

function renderSeoSupport(seo) {
  const section = document.getElementById('seo-support-section');
  if (!section || !seo) return;

  setText('seo-hidden-h1', seo.hidden_h1);
  setText('seo-primary-title', seo.hidden_h2_primary);
  setText('seo-secondary-title', seo.hidden_h2_secondary);

  const copy = document.getElementById('seo-support-copy');
  if (copy) {
    const paragraphs = safeTrim(seo.hidden_support_text)
      .split(/\n\s*\n/)
      .map((item) => item.trim())
      .filter(Boolean);

    copy.innerHTML = paragraphs.map((paragraph) => `<p>${esc(paragraph)}</p>`).join('');
  }

  const areasList = document.getElementById('seo-areas-list');
  if (areasList) {
    const areas = safeTrim(seo.hidden_h3_areas)
      .split(/\s*\|\s*|\s*,\s*/)
      .map((item) => item.trim())
      .filter(Boolean);

    areasList.innerHTML = areas.map((area) => `<li>${esc(area)}</li>`).join('');
  }

  const faqList = document.getElementById('seo-faq-list');
  if (faqList) {
    const faqs = Array.isArray(seo.faqs)
      ? seo.faqs.filter((item) => item && safeTrim(item.question) && safeTrim(item.answer))
      : [];

    faqList.innerHTML = faqs.map((item, index) => `
      <details class="seo-faq-item"${index === 0 ? ' open' : ''}>
        <summary>${esc(item.question)}</summary>
        <p>${esc(item.answer)}</p>
      </details>
    `).join('');
  }

  const hasPrimary = safeTrim(seo.hidden_h2_primary);
  const hasSecondary = safeTrim(seo.hidden_h2_secondary);
  const hasSupport = safeTrim(seo.hidden_support_text);
  const hasFaqs = Array.isArray(seo.faqs) && seo.faqs.some((item) => item && safeTrim(item.question) && safeTrim(item.answer));
  section.hidden = !(hasPrimary || hasSecondary || hasSupport || hasFaqs);
}

function renderSeoInternalLinks(services, seo) {
  const container = document.getElementById('seo-intent-links');
  if (!container) return;

  const categoryLinks = services && Array.isArray(services.categories)
    ? services.categories.slice(0, 3).map((category) => ({
        href: `#services-${slugify(category.id || category.title, 'categoria')}`,
        title: safeTrim(category.title, 'Servicios'),
        text: `Ver ${safeTrim(category.title, 'servicios').toLowerCase()} disponibles, precios y tiempos.`,
      }))
    : [];

  const areaLabels = safeTrim(seo && seo.hidden_h3_areas)
    .split(/\s*\|\s*|\s*,\s*/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  const areaLinks = areaLabels.map((label) => ({
    href: '#ubicacion',
    title: label,
    text: `Cómo llegar desde ${label.replace(/^Barber[ií]a\s+(en|cerca de)\s+/i, '')}.`,
  }));

  const baseLinks = [
    {
      href: '#servicios',
      title: 'Cortes y barba en Madrid',
      text: 'Explora todos los servicios de barbería y tratamientos.',
    },
    {
      href: '#seo-faq-title',
      title: 'Preguntas antes de venir',
      text: 'Resuelve dudas sobre cita, precios y servicios.',
    },
    {
      href: '/productos/',
      title: 'Productos Faded',
      text: 'Consulta ceras, bebidas y productos disponibles en tienda.',
    },
    {
      href: '#ubicacion',
      title: 'Barbería en Ciudad Lineal',
      text: 'Dirección, horario y cómo llegar a Faded Barbershop.',
    },
  ];

  const links = [...categoryLinks, ...areaLinks, ...baseLinks].slice(0, 8);
  container.innerHTML = links.map((item) => `
    <a class="seo-link-card reveal" href="${esc(item.href)}">
      <span class="seo-link-card__title">${esc(item.title)}</span>
      <span class="seo-link-card__text">${esc(item.text)}</span>
    </a>
  `).join('');

  revealNow(container.querySelectorAll('.reveal'));
}

function animateCounter(counter) {
  if (!counter || counter.dataset.animated === 'true') return;

  const target = Number.parseInt(counter.dataset.target || '0', 10);
  if (!Number.isFinite(target) || target <= 0) {
    counter.textContent = '0';
    counter.dataset.animated = 'true';
    return;
  }

  counter.dataset.animated = 'true';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    counter.textContent = String(target);
    return;
  }

  const duration = 1400;
  const startTime = performance.now();

  function frame(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    counter.textContent = String(Math.round(target * eased));
    if (progress < 1) {
      window.requestAnimationFrame(frame);
    } else {
      counter.textContent = String(target);
    }
  }

  window.requestAnimationFrame(frame);
}

function setupReviewCounters() {
  const counters = Array.from(document.querySelectorAll('.counter[data-target]'));
  if (!counters.length) return;

  if (reviewCounterObserver) {
    reviewCounterObserver.disconnect();
    reviewCounterObserver = null;
  }

  counters.forEach((counter) => {
    counter.textContent = '0';
    delete counter.dataset.animated;
  });

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCounter);
    return;
  }

  reviewCounterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        reviewCounterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.55 });

  counters.forEach((counter) => reviewCounterObserver.observe(counter));
}

function applyHome(home) {
  if (!home) return;

  setText('hero-eyebrow', home.hero_eyebrow);
  setText('hero-subtitle', home.hero_subtitle);
  setText('hero-text', home.hero_text);

  setText('services-eyebrow', home.services_eyebrow);
  setText('services-title', home.services_title);
  setText('services-desc', home.services_desc);

  setText('gallery-eyebrow', home.gallery_eyebrow);
  setText('gallery-title', home.gallery_title);
  setText('gallery-desc', home.gallery_desc);

  setText('team-eyebrow', home.team_eyebrow);
  setText('team-title', home.team_title);
  setText('teamDesc', home.team_desc);

  setText('whyusReviewsTitle', home.whyus_reviews_title);
  setText('whyusReviewsDesc', home.whyus_reviews_desc);
  setText('whyusBarbersNames', home.whyus_barbers_names);
  setText('whyusBarbersTitle', home.whyus_barbers_title);
  setText('whyusBarbersText', home.whyus_barbers_text || home.whyus_barbers_desc);
  setText('whyusLoyaltyNumber', home.whyus_loyalty_number);
  setText('whyusLoyaltyTitle', home.whyus_loyalty_title);
  setText('whyusLoyaltyDesc', home.whyus_loyalty_desc);

  const loyaltyText = document.getElementById('loyalty-text');
  if (loyaltyText && home.loyalty_text != null) {
    loyaltyText.innerHTML = esc(home.loyalty_text).replace(/\n/g, '<br>');
  }

  const loyaltyHighlight = document.getElementById('loyalty-highlight');
  if (loyaltyHighlight && home.loyalty_highlight != null) {
    loyaltyHighlight.innerHTML = esc(home.loyalty_highlight).replace('GRATIS', '<span class="loyalty-free">GRATIS</span>');
  }

  setText('loyalty-sub', home.loyalty_sub);
}

function applyConfig(configData) {
  const config = normalizeConfig(configData);

  if (config.booksy_url) {
    BOOKSY_URL = config.booksy_url;
    document.querySelectorAll('a[href*="booksy.com/es-es/"]').forEach((a) => {
      a.href = config.booksy_url;
    });
  }

  if (config.whatsapp_href) {
    WHATSAPP_URL = config.whatsapp_href;
    document.querySelectorAll('[data-whatsapp-link]').forEach((a) => {
      a.href = config.whatsapp_href;
    });
  }

  document.querySelectorAll('a[href^="tel:"]').forEach((a) => {
    a.href = config.phone_href;
    if (!a.children.length && /\d/.test(a.textContent)) {
      a.textContent = config.phone;
    }
  });

  document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
    a.href = `mailto:${config.email}`;
    if (!a.children.length && a.textContent.includes('@')) {
      a.textContent = config.email;
    }
  });

  document.querySelectorAll('a[href*="instagram.com"]').forEach((a) => {
    a.href = config.instagram_url;
  });

  document.querySelectorAll('a[href*="maps.google.com"]').forEach((a) => {
    a.href = config.maps_url;
  });

  document.querySelectorAll('.footer-tagline').forEach((el) => {
    el.textContent = config.tagline;
  });

  setText('gallery-instagram-handle', config.instagram_handle);
  setText('heroReviewsScore', config.reviews_score);
  setText('heroReviewsCount', `${config.reviews_count_label} reseñas en Booksy`);
  setAttr('heroRating', 'aria-label', `${config.reviews_score} estrellas en Booksy, ${config.reviews_count_label} reseñas`);

  const reviewCounter = document.getElementById('reviewsCounter');
  const reviewsFeature = document.getElementById('reviewsFeatureNumber');
  if (reviewCounter) {
    reviewCounter.dataset.target = config.reviews_count;
  }
  if (reviewsFeature) {
    reviewsFeature.setAttribute('aria-label', `${config.reviews_count_label} reseñas con valoración ${config.reviews_score} estrellas en Booksy`);
  }

  setText('contactAddressStreet', config.address_street);
  setText('contactAddressCity', config.address_city);
  setAttr('contactMapsLink', 'href', config.maps_url);
  setAttr('contactMapEmbed', 'src', config.maps_embed_url);
  setAttr('googleReviewLink', 'href', config.google_review_url);

  setText('contactPhoneText', config.phone);
  setAttr('contactPhoneLink', 'href', config.phone_href);

  setText('contactWhatsappText', `WhatsApp: ${config.whatsapp} →`);
  setAttr('contactWhatsappLink', 'href', config.whatsapp_href);

  setText('contactEmailText', `${config.email} →`);
  setAttr('contactEmailLink', 'href', `mailto:${config.email}`);

  setHTML('hoursLunes', `<strong>${esc(config.hours_lunes)}</strong>`);
  setHTML('hoursMartes', `<strong>${esc(config.hours_martes)}</strong>`);
  setHTML('hoursMiercoles', `<strong>${esc(config.hours_miercoles)}</strong>`);
  setHTML('hoursJueves', `<strong>${esc(config.hours_jueves)}</strong>`);
  setHTML('hoursViernes', `<strong>${esc(config.hours_viernes)}</strong>`);
  setHTML('hoursSabado', `<strong>${esc(config.hours_sabado)}</strong>`);
  setHTML('hoursDomingo', `<strong>${esc(config.hours_domingo)}</strong>`);

  setText('productsWhatsappButton', 'Confirmar por WhatsApp');
  setAttr('productsWhatsappButton', 'href', config.whatsapp_href);
  setAttr('productsMapsButton', 'href', config.maps_url);
  setText('productsAddressStreet', config.address_street);
  setText('productsAddressCity', config.address_city);
  setText('productsHoursWeekdays', `Lun–Jue: ${config.hours_lunes} · Vie–Sáb: ${config.hours_viernes}`);
  setText('productsHoursWeekend', `Dom: ${config.hours_domingo}`);

  setText('legalContactEmail', config.email);
  setAttr('legalContactEmail', 'href', `mailto:${config.email}`);

  setupReviewCounters();

  if (window.FadedAnalytics && typeof window.FadedAnalytics.applyConfig === 'function') {
    window.FadedAnalytics.applyConfig(config);
  }
}

function applySEO(seo) {
  if (!seo) return;

  if (seo.site_title) document.title = seo.site_title;
  setMeta('description', seo.meta_description);
  setMeta('keywords', seo.meta_keywords);

  if (seo.canonical_url) {
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', seo.canonical_url);
    setMetaProp('og:url', seo.canonical_url);
  }

  setMetaProp('og:title', seo.og_title);
  setMetaProp('og:description', seo.og_description);
  setMetaProp('og:image', seo.og_image);
  setMeta('twitter:title', seo.twitter_title);
  setMeta('twitter:description', seo.twitter_description);
  setMeta('twitter:image', seo.og_image);
  renderSeoSupport(seo);
  updateFaqSchema(seo);
}

function badgeMarkup(type) {
  if (type === 'premium') {
    return '<span class="service-badge service-badge--premium">PREMIUM</span>';
  }
  if (type === 'featured') {
    return '<span class="service-badge">POPULAR</span>';
  }
  return '';
}

function cardClassByType(type) {
  if (type === 'premium') return 'service-card service-card--premium';
  if (type === 'featured') return 'service-card service-card--featured';
  return 'service-card';
}

function renderServices(data) {
  const container = document.getElementById('services-container');
  if (!container || !data || !Array.isArray(data.categories)) return;

  container.innerHTML = data.categories.map((category, index) => {
    const items = Array.isArray(category.items) ? category.items : [];
    const gridClass = items.length <= 2 ? 'services-grid services-grid--2col' : 'services-grid';

    const cards = items.map((item) => {
      const priceValue = extractPriceValue(item.price);
      const sumupBtn = item.sumup_link
        ? `<a href="${esc(item.sumup_link)}" class="btn btn-gold btn-service--sm js-track-service" target="_blank" rel="noopener noreferrer" data-service-name="${esc(item.name)}" data-service-price="${priceValue}">Pagar ahora</a>`
        : '';

      return `
        <article class="${cardClassByType(item.type)}">
          ${badgeMarkup(item.type)}
          <div class="service-info">
            <h4 class="service-name">${item.service_url ? `<a href="${esc(item.service_url)}" class="service-name-link">${esc(item.name)}</a>` : esc(item.name)}</h4>
            ${item.desc ? `<p class="service-desc-small">${esc(item.desc)}</p>` : ''}
            <p class="service-duration">${esc(item.duration || '')}</p>
          </div>
          <div class="service-price-wrap">
            <div class="service-price ${item.type === 'premium' ? 'service-price--large' : ''}">${esc(item.price || '')}</div>
            <div class="service-btns">
              <a href="${esc(BOOKSY_URL)}" class="btn btn-service btn-service--sm" target="_blank" rel="noopener noreferrer">Reservar</a>
              ${sumupBtn}
            </div>
          </div>
        </article>
      `;
    }).join('');

    return `
      <section class="service-category reveal reveal-delay-${Math.min(index + 1, 3)}" id="services-${slugify(category.id || category.title, 'categoria')}">
        <h3 class="category-title"><span>${esc(category.title || '')}</span><span class="category-line"></span></h3>
        <div class="${gridClass}">${cards}</div>
      </section>
    `;
  }).join('');

  revealNow(container.querySelectorAll('.reveal'));
}

function renderTeam(data) {
  const container = document.getElementById('team-container');
  if (!container || !data || !Array.isArray(data.members)) return;

  const visible = data.members.filter((m) => m.active !== false);
  container.innerHTML = visible.map((member, idx) => `
    <article class="team-card reveal reveal-delay-${Math.min(idx + 1, 3)}">
      <div class="team-photo-wrap">
        <img src="${esc(member.photo || '/assets/images/logo.png')}" alt="${esc(member.name || 'Barbero de Faded Barbershop')}" loading="lazy">
        <div class="team-photo-overlay" aria-hidden="true"></div>
      </div>
      <div class="team-info">
        <h3 class="team-name">${esc(member.name || '')}</h3>
        <p class="team-role">${esc(member.role || '')}</p>
        <p class="team-desc">${esc(member.desc || '')}</p>
        <p class="team-rating"><span class="stars" aria-hidden="true">★★★★★</span><span>5.0 en Booksy</span></p>
      </div>
    </article>
  `).join('');

  revealNow(container.querySelectorAll('.reveal'));
}

function renderGallery(data) {
  const container = document.getElementById('gallery-container');
  if (!container || !data || !Array.isArray(data.images)) return;

  galleryLightboxItems = data.images;

  container.innerHTML = data.images.map((img, index) => `
    <article class="gallery-item reveal reveal-delay-${(index % 3) + 1}" role="listitem">
      <button class="gallery-btn" type="button" data-gallery-open="${index}" aria-label="Abrir imagen ${index + 1}">
        <img src="${esc(img.src)}" alt="${esc(img.alt || 'Trabajo de Faded Barbershop')}" loading="lazy">
        <span class="gallery-overlay" aria-hidden="true">Ver</span>
      </button>
    </article>
  `).join('');

  revealNow(container.querySelectorAll('.reveal'));
}

function productCardMarkup(item, delay, includeFichaButton) {
  const details = Array.isArray(item.details)
    ? item.details.map((d) => `<li>${esc(typeof d === 'string' ? d : d && d.detail ? d.detail : '')}</li>`).join('')
    : '';

  const hasDetails = details.trim().length > 0;
  const productUrl = item.product_url || '';
  const priceValue = extractPriceValue(item.price);

  const fichaBtn = includeFichaButton && productUrl
    ? `<a href="${esc(productUrl)}" class="btn btn-outline" aria-label="Ver ficha de ${esc(item.name)}">Ver ficha</a>`
    : '';

  const sumupBtn = item.sumup_link
    ? `<a href="${esc(item.sumup_link)}" class="btn btn-gold js-track-product" target="_blank" rel="noopener noreferrer" data-product-name="${esc(item.name)}" data-product-price="${priceValue}">Comprar online</a>`
    : `<a href="${esc(WHATSAPP_URL)}" class="btn btn-gold" target="_blank" rel="noopener noreferrer">Consultar</a>`;

  return `
    <article class="product-card reveal reveal-delay-${delay}">
      <span class="product-tag">${esc(item.category || 'Producto')}</span>
      ${item.image ? `<div class="product-media"><img class="product-image" src="${esc(item.image)}" alt="${esc(item.image_alt || item.name || 'Producto de Faded')}" loading="lazy"></div>` : ''}
      <h3 class="product-title">${esc(item.name || '')}</h3>
      <p class="product-copy">${esc(item.description || '')}</p>
      ${hasDetails ? `<ul class="product-details" role="list">${details}</ul>` : ''}
      <div class="product-card-footer">
        <div class="product-price">${esc(item.price || '')}</div>
        <div class="product-card-btns">
          ${fichaBtn}
          ${sumupBtn}
        </div>
      </div>
    </article>
  `;
}

function renderProductsHome(products) {
  const eyebrow = document.getElementById('products-home-eyebrow');
  const title = document.getElementById('products-home-title');
  const desc = document.getElementById('products-home-desc');
  const container = document.getElementById('products-home-container');

  if (eyebrow && products.home_eyebrow) eyebrow.textContent = products.home_eyebrow;
  if (title && products.home_title) title.textContent = products.home_title;
  if (desc && products.home_desc) desc.textContent = products.home_desc;

  if (!container) return;

  const items = (products.items || []).filter((item) => item.active !== false && item.show_on_home !== false).slice(0, 6);
  if (!items.length) {
    container.innerHTML = '<article class="product-card"><span class="product-tag">Productos</span><h3 class="product-title">Pronto más productos</h3><p class="product-copy">Estamos actualizando el catálogo con nuevas referencias.</p></article>';
    return;
  }

  container.innerHTML = items.map((item, idx) => productCardMarkup(item, Math.min((idx % 3) + 1, 3), true)).join('');
  revealNow(container.querySelectorAll('.reveal'));
}

function renderProductsPage(products) {
  const container = document.getElementById('products-page-container');
  if (!container) return;

  setText('products-page-title', products.page_title);
  setText('products-page-desc', products.page_desc);
  setText('products-page-note', products.page_note);

  const items = (products.items || []).filter((item) => item.active !== false);
  if (!items.length) {
    container.innerHTML = '<article class="product-card"><span class="product-tag">Productos</span><h2 class="product-title">Sin productos visibles</h2><p class="product-copy">Activa productos desde /admin para mostrarlos aquí.</p></article>';
    return;
  }

  container.innerHTML = items.map((item, idx) => productCardMarkup(item, Math.min((idx % 3) + 1, 3), false)).join('');
  revealNow(container.querySelectorAll('.reveal'));
}

function deriveClickContext(link) {
  if (!link) return 'site';
  if (link.dataset && link.dataset.trackContext) return link.dataset.trackContext;
  if (link.id === 'contactWhatsappLink') return 'contact_whatsapp';
  if (link.id === 'contactMapsLink') return 'contact_maps';
  if (link.id === 'productsWhatsappButton') return 'products_page_whatsapp';
  if (link.id === 'productsMapsButton') return 'products_page_maps';
  if (link.classList.contains('nav-cta')) return 'header_cta';
  if (link.classList.contains('google-review-float')) return 'review_float';
  if (link.classList.contains('whatsapp-float')) return 'whatsapp_float';
  if (link.closest('.hero-actions')) return 'hero_cta';
  if (link.closest('.services-cta')) return 'services_cta';
  if (link.closest('.contact-actions')) return 'contact_cta';
  if (link.closest('.product-card')) return 'product_card';
  if (link.closest('.product-page-actions')) return 'product_detail';
  if (link.closest('.footer-social')) return 'footer_social';
  if (link.closest('.footer-nav')) return 'footer_nav';
  if (link.closest('.info-block')) return 'contact_info';
  return 'site';
}

function deriveLinkedItem(link) {
  const serviceCard = link.closest('.service-card');
  if (serviceCard) {
    const serviceName = serviceCard.querySelector('.service-name');
    const servicePrice = serviceCard.querySelector('.service-price');
    return {
      item_name: serviceName ? serviceName.textContent.trim() : '',
      value: servicePrice ? extractPriceValue(servicePrice.textContent) : 0,
      item_type: 'service',
    };
  }

  const productCard = link.closest('.product-card');
  if (productCard) {
    const productName = productCard.querySelector('.product-title');
    const productPrice = productCard.querySelector('.product-price');
    return {
      item_name: productName ? productName.textContent.trim() : '',
      value: productPrice ? extractPriceValue(productPrice.textContent) : 0,
      item_type: 'product',
    };
  }

  const productSurface = link.closest('.product-surface');
  if (productSurface) {
    const pageTitle = productSurface.querySelector('.product-page-title');
    const pagePrice = productSurface.querySelector('.product-page-price');
    return {
      item_name: pageTitle ? pageTitle.textContent.trim() : '',
      value: pagePrice ? extractPriceValue(pagePrice.textContent) : 0,
      item_type: 'product',
    };
  }

  return {};
}

function setupTrackingDelegation() {
  document.addEventListener('click', (event) => {
    const serviceBtn = event.target.closest('.js-track-service');
    if (serviceBtn && window.FadedTracking && typeof window.FadedTracking.trackServiceClick === 'function') {
      const name = serviceBtn.dataset.serviceName || 'Servicio';
      const price = Number.parseFloat(serviceBtn.dataset.servicePrice || '0') || 0;
      window.FadedTracking.trackServiceClick(name, price);
    }

    const productBtn = event.target.closest('.js-track-product');
    if (productBtn && window.FadedTracking && typeof window.FadedTracking.trackSumUpClick === 'function') {
      const name = productBtn.dataset.productName || 'Producto';
      const price = Number.parseFloat(productBtn.dataset.productPrice || '0') || 0;
      window.FadedTracking.trackSumUpClick(name, price);
    }

    const booksyLink = event.target.closest('a[href*="booksy.com"]');
    if (booksyLink && window.FadedTracking && typeof window.FadedTracking.trackBooksyClick === 'function') {
      window.FadedTracking.trackBooksyClick({
        context: deriveClickContext(booksyLink),
        link_url: booksyLink.href,
        link_text: safeTrim(booksyLink.textContent),
        item_name: deriveLinkedItem(booksyLink).item_name || '',
      });
    }

    const whatsappLink = event.target.closest('a[href*="wa.me"]');
    if (whatsappLink && window.FadedTracking && typeof window.FadedTracking.trackWhatsAppClick === 'function') {
      const item = deriveLinkedItem(whatsappLink);
      window.FadedTracking.trackWhatsAppClick({
        context: deriveClickContext(whatsappLink),
        link_url: whatsappLink.href,
        link_text: safeTrim(whatsappLink.textContent),
        item_name: item.item_name || '',
        item_type: item.item_type || '',
        value: item.value || 0,
      });
    }

    const reviewLink = event.target.closest('a[href*="/review"], a.google-review-float');
    if (reviewLink && window.FadedTracking && typeof window.FadedTracking.trackReviewClick === 'function') {
      window.FadedTracking.trackReviewClick({
        context: deriveClickContext(reviewLink),
        link_url: reviewLink.href,
      });
    }

    const mapsLink = event.target.closest('a[href*="maps.google.com"]');
    if (mapsLink && window.FadedTracking && typeof window.FadedTracking.trackMapsClick === 'function') {
      window.FadedTracking.trackMapsClick({
        context: deriveClickContext(mapsLink),
        link_url: mapsLink.href,
      });
    }

    const phoneLink = event.target.closest('a[href^="tel:"]');
    if (phoneLink && window.FadedTracking && typeof window.FadedTracking.trackPhoneClick === 'function') {
      window.FadedTracking.trackPhoneClick({
        context: deriveClickContext(phoneLink),
        link_url: phoneLink.href,
        link_text: safeTrim(phoneLink.textContent),
      });
    }

    const emailLink = event.target.closest('a[href^="mailto:"]');
    if (emailLink && window.FadedTracking && typeof window.FadedTracking.trackEmailClick === 'function') {
      window.FadedTracking.trackEmailClick({
        context: deriveClickContext(emailLink),
        link_url: emailLink.href,
        link_text: safeTrim(emailLink.textContent),
      });
    }
  });
}

function setupMapInteractionTracking() {
  const mapBlock = document.querySelector('.location-map');
  if (!mapBlock) return;

  let tracked = false;
  const markInteraction = () => {
    if (tracked) return;
    tracked = true;
    if (window.FadedTracking && typeof window.FadedTracking.trackMapInteraction === 'function') {
      window.FadedTracking.trackMapInteraction({
        context: 'embedded_map',
        link_url: mapBlock.querySelector('iframe') ? mapBlock.querySelector('iframe').src : '',
      });
    }
  };

  mapBlock.addEventListener('pointerdown', markInteraction, { passive: true });
  mapBlock.addEventListener('touchstart', markInteraction, { passive: true });
  mapBlock.addEventListener('focusin', markInteraction);
}

function setupFirstCutDiscountPopup() {
  const STORAGE_KEY = 'faded_first_cut_discount_popup_seen_at';
  const DAY_MS = 24 * 60 * 60 * 1000;
  const SHOW_DELAY_MS = 7000;
  const whatsappMessage = 'He visto vuestra web y quiero probar mi primer corte con 20% de descuento!';
  const whatsappHref = `https://wa.me/34603147958?text=${encodeURIComponent(whatsappMessage)}`;

  function getLastSeenAt() {
    try {
      return Number.parseInt(window.localStorage.getItem(STORAGE_KEY) || '0', 10) || 0;
    } catch (error) {
      return 0;
    }
  }

  function markSeen() {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch (error) {
      // Si localStorage falla, el popup sigue funcionando sin persistencia.
    }
  }

  function trackPopup(eventName, details) {
    if (window.FadedTracking && typeof window.FadedTracking.trackPopupEvent === 'function') {
      window.FadedTracking.trackPopupEvent(eventName, details || {});
    }
  }

  function closePopup(reason) {
    const popup = document.getElementById('first-cut-popup');
    if (!popup) return;
    popup.classList.remove('is-visible');
    popup.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('has-first-cut-popup');
    window.setTimeout(() => popup.remove(), 260);
    trackPopup('popup_close', { close_reason: reason || 'manual' });
  }

  function showPopup() {
    if (document.getElementById('first-cut-popup')) return;
    if (Date.now() - getLastSeenAt() < DAY_MS) return;

    markSeen();

    const popup = document.createElement('div');
    popup.id = 'first-cut-popup';
    popup.className = 'first-cut-popup';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-modal', 'true');
    popup.setAttribute('aria-hidden', 'true');
    popup.setAttribute('aria-labelledby', 'first-cut-popup-title');
    popup.innerHTML = `
      <div class="first-cut-popup__backdrop" data-popup-close="backdrop"></div>
      <div class="first-cut-popup__panel" role="document">
        <button class="first-cut-popup__close" type="button" data-popup-close="button" aria-label="Cerrar promoción">×</button>
        <p class="first-cut-popup__eyebrow">Solo nuevos clientes</p>
        <h2 class="first-cut-popup__title" id="first-cut-popup-title">Tu primer corte en FADED con <span>20% dto.</span></h2>
        <p class="first-cut-popup__copy">Reserva prioridad por WhatsApp y prueba nuestro acabado premium con una plaza limitada de bienvenida.</p>
        <div class="first-cut-popup__benefits" aria-label="Ventajas de la promoción">
          <span>Plazas limitadas</span>
          <span>Reserva prioritaria</span>
          <span>Experiencia FADED</span>
        </div>
        <div class="first-cut-popup__cta-wrap">
          <span class="first-cut-popup__hint" aria-hidden="true">¡Click aquí!</span>
          <a class="btn btn-gold first-cut-popup__cta"
             href="${esc(whatsappHref)}"
             target="_blank"
             rel="noopener noreferrer"
             data-track-context="popup_first_cut_discount"
             aria-label="Pedir primer corte con 20% de descuento por WhatsApp">
            Quiero mi 20%
          </a>
        </div>
        <p class="first-cut-popup__fineprint">Oferta para primera visita. Escríbenos y te confirmamos disponibilidad.</p>
      </div>
    `;

    document.body.appendChild(popup);
    document.body.classList.add('has-first-cut-popup');

    const closeButton = popup.querySelector('.first-cut-popup__close');
    const cta = popup.querySelector('.first-cut-popup__cta');

    popup.addEventListener('click', (event) => {
      const closeTarget = event.target.closest('[data-popup-close]');
      if (closeTarget) closePopup(closeTarget.getAttribute('data-popup-close'));
    });

    if (cta) {
      cta.addEventListener('click', () => {
        trackPopup('popup_whatsapp_click', {
          context: 'popup_first_cut_discount',
          link_url: cta.href,
          link_text: safeTrim(cta.textContent),
        });
        closePopup('whatsapp_click');
      });
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && document.getElementById('first-cut-popup')) {
        closePopup('escape');
        document.removeEventListener('keydown', onKeyDown);
      }
    };
    document.addEventListener('keydown', onKeyDown);

    window.requestAnimationFrame(() => {
      popup.setAttribute('aria-hidden', 'false');
      popup.classList.add('is-visible');
      if (closeButton) closeButton.focus({ preventScroll: true });
      trackPopup('popup_view', { context: 'popup_first_cut_discount' });
    });
  }

  window.setTimeout(showPopup, SHOW_DELAY_MS);
}

function setupHeroMedia() {
  const hero = document.querySelector('.hero');
  const video = document.getElementById('heroVideo');
  if (!hero || !video) return;

  const desktopSrc = safeTrim(video.dataset.desktopSrc);
  const mobileSrc = safeTrim(video.dataset.mobileSrc, desktopSrc);
  const source = video.querySelector('source') || document.createElement('source');
  const mobileQuery = window.matchMedia('(max-width: 640px)');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  let currentSrc = safeTrim(source.getAttribute('src'));

  if (!source.parentNode) {
    source.type = 'video/mp4';
    video.appendChild(source);
  }

  const syncReadyState = () => {
    const isReady = video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
    video.classList.toggle('is-ready', isReady && !hero.classList.contains('hero--image-only'));
  };

  const disableVideo = () => {
    hero.classList.add('hero--image-only');
    video.classList.remove('is-ready');
    video.pause();
    if (currentSrc || source.getAttribute('src')) {
      source.removeAttribute('src');
      currentSrc = '';
      video.load();
    }
  };

  const enableVideo = (nextSrc) => {
    if (!nextSrc) {
      disableVideo();
      return;
    }

    hero.classList.remove('hero--image-only');
    video.muted = true;
    video.defaultMuted = true;

    if (nextSrc !== currentSrc) {
      currentSrc = nextSrc;
      source.setAttribute('src', nextSrc);
      video.classList.remove('is-ready');
      video.load();
    }

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        hero.classList.add('hero--image-only');
      });
    }
  };

  const updateHeroMedia = () => {
    const saveDataEnabled = Boolean(connection && connection.saveData);
    const effectiveType = safeTrim(connection && connection.effectiveType);
    const slowConnection = /(?:^|-)2g$|^3g$/i.test(effectiveType);
    const shouldUseVideo = !reducedMotionQuery.matches && !saveDataEnabled && !slowConnection;
    const nextSrc = mobileQuery.matches ? (mobileSrc || desktopSrc) : desktopSrc;

    if (!shouldUseVideo) {
      disableVideo();
      return;
    }

    enableVideo(nextSrc);
  };

  video.addEventListener('loadeddata', syncReadyState);
  video.addEventListener('canplay', syncReadyState);
  video.addEventListener('playing', syncReadyState);
  video.addEventListener('error', disableVideo);

  const onMediaChange = () => {
    updateHeroMedia();
  };

  updateHeroMedia();

  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', onMediaChange);
    reducedMotionQuery.addEventListener('change', onMediaChange);
  } else {
    mobileQuery.addListener(onMediaChange);
    reducedMotionQuery.addListener(onMediaChange);
  }

  if (connection && typeof connection.addEventListener === 'function') {
    connection.addEventListener('change', onMediaChange);
  }
}

function setupHeaderState() {
  const header = document.getElementById('header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 24) {
      header.classList.add('scrolled');
      header.classList.remove('transparent');
    } else {
      header.classList.add('transparent');
      header.classList.remove('scrolled');
    }
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function setupHamburger() {
  const button = document.getElementById('hamburger');
  const nav = document.getElementById('nav-links');
  if (!button || !nav) return;

  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open', !expanded);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      button.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
    });
  });
}

function setupScrollTop() {
  const button = document.getElementById('scroll-top');
  if (!button) return;

  const onScroll = () => {
    button.hidden = window.scrollY < 600;
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function revealNow(nodes) {
  nodes.forEach((node) => node.classList.add('revealed'));
}

function setupRevealObserver() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length || !('IntersectionObserver' in window)) {
    revealNow(Array.from(items));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  items.forEach((item) => observer.observe(item));
}

function setupLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const img = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');
  const backdrop = document.getElementById('lightbox-backdrop');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  function openLightbox(index) {
    if (!galleryLightboxItems.length) return;
    galleryLightboxIndex = Math.max(0, Math.min(index, galleryLightboxItems.length - 1));
    const item = galleryLightboxItems[galleryLightboxIndex];
    img.src = item.src;
    img.alt = item.alt || 'Imagen de galeria';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function changeImage(delta) {
    if (!galleryLightboxItems.length) return;
    let next = galleryLightboxIndex + delta;
    if (next < 0) next = galleryLightboxItems.length - 1;
    if (next >= galleryLightboxItems.length) next = 0;
    openLightbox(next);
  }

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-gallery-open]');
    if (!trigger) return;
    const index = Number.parseInt(trigger.getAttribute('data-gallery-open'), 10);
    if (Number.isInteger(index)) openLightbox(index);
  });

  closeBtn.addEventListener('click', closeLightbox);
  backdrop.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => changeImage(-1));
  nextBtn.addEventListener('click', () => changeImage(1));

  document.addEventListener('keydown', (event) => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') changeImage(-1);
    if (event.key === 'ArrowRight') changeImage(1);
  });
}

async function loadContent() {
  const [home, services, team, gallery, config, seo, products, notice] = await Promise.all([
    readJson('/_data/home.json'),
    readJson('/_data/services.json'),
    readJson('/_data/team.json'),
    readJson('/_data/gallery.json'),
    readJson('/_data/config.json'),
    readJson('/_data/seo.json'),
    readJson('/_data/products.json'),
    readJson('/_data/notice.json'),
  ]);

  renderNoticeBar(notice);
  applyHome(home);
  applyConfig(config);
  if (isHomePage()) {
    applySEO(seo);
    renderSeoInternalLinks(services, seo);
  }
  updateLocalBusinessSchema(normalizeConfig(config), services, seo);
  renderServices(services);
  renderTeam(team);
  renderGallery(gallery);
  if (products) {
    renderProductsHome(products);
    renderProductsPage(products);
  }

  setupRevealObserver();
}

document.addEventListener('DOMContentLoaded', () => {
  setupHeaderState();
  setupHamburger();
  setupScrollTop();
  setupHeroMedia();
  setupTrackingDelegation();
  setupMapInteractionTracking();
  setupFirstCutDiscountPopup();
  setupLightbox();
  syncNoticeOffset();
  window.addEventListener('resize', syncNoticeOffset, { passive: true });
  loadContent();
});


/* ── Animación de contadores ── */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const animateCounter = (counter) => {
    if (counter.dataset.counted === 'true') return;
    counter.dataset.counted = 'true';

    const target = parseInt(counter.dataset.target || '0', 10);
    const duration = 1400;
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      counter.textContent = current.toString();

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        counter.textContent = target.toString();
      }
    }

    requestAnimationFrame(tick);
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });

    counters.forEach(counter => observer.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }
}
