'use strict';

let BOOKSY_URL = 'https://booksy.com/es-es/72058_faded-barbershop_barberia_53009_madrid';
const DEFAULT_WHATSAPP_URL = 'https://wa.me/34603147958';

let galleryLightboxItems = [];
let galleryLightboxIndex = 0;

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
  if (el && value) el.textContent = value;
}

function setMeta(name, content) {
  if (!content) return;
  const el = document.querySelector(`meta[name="${name}"]`);
  if (el) el.setAttribute('content', content);
}

function setMetaProp(property, content) {
  if (!content) return;
  const el = document.querySelector(`meta[property="${property}"]`);
  if (el) el.setAttribute('content', content);
}

async function readJson(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
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
  if (loyaltyText && home.loyalty_text) {
    loyaltyText.innerHTML = esc(home.loyalty_text).replace(/\n/g, '<br>');
  }

  const loyaltyHighlight = document.getElementById('loyalty-highlight');
  if (loyaltyHighlight && home.loyalty_highlight) {
    loyaltyHighlight.innerHTML = esc(home.loyalty_highlight).replace('GRATIS', '<span class="loyalty-free">GRATIS</span>');
  }

  setText('loyalty-sub', home.loyalty_sub);
}

function applyConfig(config) {
  if (!config) return;

  if (config.booksy_url) {
    BOOKSY_URL = config.booksy_url;
    document.querySelectorAll('a[href*="booksy.com/es-es/"]').forEach((a) => {
      a.href = config.booksy_url;
    });
  }

  if (config.whatsapp_href) {
    document.querySelectorAll('a[href*="wa.me"]').forEach((a) => {
      a.href = config.whatsapp_href;
    });
  }

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
  }

  setMetaProp('og:title', seo.og_title);
  setMetaProp('og:description', seo.og_description);
  setMeta('twitter:title', seo.twitter_title);
  setMeta('twitter:description', seo.twitter_description);
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
            <h4 class="service-name">${esc(item.name)}</h4>
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
      <section class="service-category reveal reveal-delay-${Math.min(index + 1, 3)}">
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
        <p class="team-rating"><span class="stars" aria-hidden="true">★★★★★</span><span>5.0 valoración clientes</span></p>
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
    : `<a href="${DEFAULT_WHATSAPP_URL}" class="btn btn-gold" target="_blank" rel="noopener noreferrer">Consultar</a>`;

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
  });
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
  const [home, services, team, gallery, config, seo, products] = await Promise.all([
    readJson('/_data/home.json'),
    readJson('/_data/services.json'),
    readJson('/_data/team.json'),
    readJson('/_data/gallery.json'),
    readJson('/_data/config.json'),
    readJson('/_data/seo.json'),
    readJson('/_data/products.json'),
  ]);

  applyHome(home);
  applyConfig(config);
  applySEO(seo);
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
  setupTrackingDelegation();
  setupLightbox();
  loadContent();
});
