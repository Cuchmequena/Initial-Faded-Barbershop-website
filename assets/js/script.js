/* ============================================================
   FADED BARBERSHOP — JavaScript Principal
   ============================================================ */

'use strict';

const BOOKSY_URL = 'https://booksy.com/es-es/72058_faded-barbershop_barberia_53009_madrid';

/* ── Escape HTML para evitar XSS al renderizar JSON ── */
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Formato robusto del precio para evitar problemas con el símbolo € ── */
function formatPrice(price) {
  const raw = String(price || '').trim();
  if (!raw) {
    return { html: '', aria: '' };
  }

  const compact = raw.replace(/\s+/g, '');
  const match = compact.match(/^([\d.,]+)(?:([€Cc])|EUR)?(\+)?$/i);
  if (!match) {
    return { html: esc(raw), aria: raw };
  }

  const amount = match[1];
  const hasCurrency = /([€Cc]|EUR)/i.test(compact);
  const plus = compact.endsWith('+');

  if (!hasCurrency) {
    return { html: esc(raw), aria: raw };
  }

  return {
    html: `<span class="price-amount">${esc(amount)}</span><span class="price-currency" aria-hidden="true">&#8364;</span>${plus ? '<span class="price-plus" aria-hidden="true">+</span>' : ''}`,
    aria: `${amount} euros${plus ? ' o más' : ''}`,
  };
}

/* ── 1. Carga de contenido desde _data/*.json ── */
async function loadContent() {
  const results = await Promise.allSettled([
    fetch('/_data/services.json').then(r => r.ok ? r.json() : null),
    fetch('/_data/team.json').then(r => r.ok ? r.json() : null),
    fetch('/_data/gallery.json').then(r => r.ok ? r.json() : null),
    fetch('/_data/home.json').then(r => r.ok ? r.json() : null),
    fetch('/_data/config.json').then(r => r.ok ? r.json() : null),
  ]);

  const [servicesRes, teamRes, galleryRes, homeRes, configRes] = results;

  if (configRes.status === 'fulfilled' && configRes.value) {
    applyConfig(configRes.value);
  }
  if (homeRes.status === 'fulfilled' && homeRes.value) {
    applyHome(homeRes.value);
  }
  if (servicesRes.status === 'fulfilled' && servicesRes.value) {
    renderServices(servicesRes.value);
  }
  if (teamRes.status === 'fulfilled' && teamRes.value) {
    renderTeam(teamRes.value);
  }
  if (galleryRes.status === 'fulfilled' && galleryRes.value) {
    renderGallery(galleryRes.value);
  }

  /* Re-inicializar animaciones y lightbox después de renderizar */
  initReveal();
  initLightbox();
}

/* ── Aplicar config.json (teléfono, WhatsApp, Booksy, etc.) ── */
function applyConfig(cfg) {
  /* Actualizar BOOKSY_URL global para los botones de reserva */
  if (cfg.booksy_url) {
    document.querySelectorAll('a[href*="booksy.com"]').forEach(a => {
      a.href = cfg.booksy_url;
    });
  }
  /* WhatsApp flotante y enlaces */
  if (cfg.whatsapp_href) {
    document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
      a.href = cfg.whatsapp_href;
    });
  }
  /* Teléfono */
  if (cfg.phone_href) {
    document.querySelectorAll('a[href^="tel:"]').forEach(a => {
      a.href = cfg.phone_href;
      if (a.classList.contains('info-link-phone') && cfg.phone) {
        a.textContent = cfg.phone;
      }
    });
  }
  /* Email */
  if (cfg.email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
      a.href = `mailto:${cfg.email}`;
      if (a.textContent.includes('@')) a.textContent = `${cfg.email} →`;
    });
  }
  /* Instagram */
  if (cfg.instagram_url) {
    document.querySelectorAll('a[href*="instagram.com"]').forEach(a => {
      a.href = cfg.instagram_url;
    });
  }
  /* Google Maps */
  if (cfg.maps_url) {
    document.querySelectorAll('a[href*="maps.google.com"]').forEach(a => {
      a.href = cfg.maps_url;
    });
  }
  /* Horario */
  const scheduleRows = document.querySelectorAll('.schedule-table tr');
  if (scheduleRows.length >= 1 && cfg.hours_weekdays_label) {
    scheduleRows[0].cells[0].textContent = cfg.hours_weekdays_label;
    scheduleRows[0].cells[1].innerHTML = `<strong>${esc(cfg.hours_weekdays_time)}</strong>`;
  }
  if (scheduleRows.length >= 2 && cfg.hours_weekend_label) {
    scheduleRows[1].cells[0].textContent = cfg.hours_weekend_label;
    scheduleRows[1].cells[1].innerHTML = `<strong class="closed">${esc(cfg.hours_weekend_time)}</strong>`;
  }
  /* Dirección */
  const addr = document.querySelector('address.info-text');
  if (addr && cfg.address_street && cfg.address_city) {
    addr.innerHTML = `${esc(cfg.address_street)}<br>${esc(cfg.address_city)}`;
  }
  /* Contador reseñas */
  if (cfg.reviews_count) {
    document.querySelectorAll('.counter').forEach(c => {
      c.dataset.target = cfg.reviews_count;
    });
  }
}

/* ── Aplicar home.json (textos de la página) ── */
function applyHome(h) {
  const setText = (id, val) => {
    if (!val) return;
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setText('hero-eyebrow', h.hero_eyebrow);
  setText('hero-subtitle', h.hero_subtitle);

  /* loyalty */
  if (h.loyalty_text) {
    const lt = document.getElementById('loyalty-text');
    if (lt) lt.innerHTML = esc(h.loyalty_text).replace(/\n/g, '<br>');
  }
  if (h.loyalty_highlight) {
    const lh = document.getElementById('loyalty-highlight');
    if (lh) {
      const freeWord = h.loyalty_highlight.includes('GRATIS') ? 'GRATIS' : '';
      const text = freeWord
        ? h.loyalty_highlight.replace(freeWord, `<span class="loyalty-free">${freeWord}</span>`)
        : esc(h.loyalty_highlight);
      lh.innerHTML = text;
    }
  }
  setText('loyalty-sub', h.loyalty_sub);
}

/* ── Render: Servicios ── */
function renderServices(data) {
  const container = document.getElementById('services-container');
  if (!container || !data.categories) return;

  container.innerHTML = data.categories.map(cat => {
    const is2col = cat.items.length <= 2;
    return `
      <div class="service-category reveal">
        <h3 class="category-title">
          <span class="category-line" aria-hidden="true"></span>
          ${esc(cat.title)}
          <span class="category-line" aria-hidden="true"></span>
        </h3>
        <div class="services-grid ${is2col ? 'services-grid--2col' : ''}">
          ${cat.items.map(item => renderServiceCard(item)).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function renderServiceCard(item) {
  const feat = item.type === 'featured';
  const prem = item.type === 'premium';
  const price = formatPrice(item.price);
  return `
    <article class="service-card${feat ? ' service-card--featured' : ''}${prem ? ' service-card--premium' : ''} reveal">
      ${feat ? '<div class="service-badge" aria-label="Servicio popular">POPULAR</div>' : ''}
      ${prem ? '<div class="service-badge service-badge--premium" aria-label="Servicio premium">PREMIUM</div>' : ''}
      <div class="service-info">
        <h4 class="service-name">${esc(item.name)}</h4>
        ${item.desc ? `<p class="service-desc-small">${esc(item.desc)}</p>` : ''}
        <p class="service-duration">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          ${esc(item.duration)}
        </p>
      </div>
      <div class="service-price-wrap">
        <span class="service-price${prem ? ' service-price--large' : ''}" aria-label="${esc(price.aria)}">${price.html}</span>
        <a href="${esc(BOOKSY_URL)}"
           class="btn ${prem ? 'btn-gold' : 'btn-service'}"
           target="_blank"
           rel="noopener noreferrer"
           aria-label="Reservar ${esc(item.name)}">
          Reservar
        </a>
      </div>
    </article>
  `;
}

/* ── Render: Equipo ── */
function renderTeam(data) {
  const container = document.getElementById('team-container');
  if (!container || !data.members) return;

  const active = data.members.filter(m => m.active !== false);
  if (!active.length) return;

  container.innerHTML = active.map(m => `
    <article class="team-card reveal">
      <div class="team-photo-wrap">
        <img src="${esc(m.photo)}"
             alt="${esc(m.name)} — ${esc(m.role)} en Faded Barbershop Madrid"
             loading="lazy"
             width="400"
             height="500">
        <div class="team-photo-overlay" aria-hidden="true"></div>
      </div>
      <div class="team-info">
        <h3 class="team-name">${esc(m.name)}</h3>
        <p class="team-role">${esc(m.role)}</p>
        <p class="team-desc">${esc(m.desc)}</p>
        <div class="team-rating" aria-label="Valoración 5 estrellas">
          <span class="stars" aria-hidden="true">★★★★★</span>
          <span>5.0</span>
        </div>
      </div>
    </article>
  `).join('');
}

/* ── Render: Galería ── */
function renderGallery(data) {
  const container = document.getElementById('gallery-container');
  if (!container || !data.images) return;

  container.innerHTML = data.images.map((img, i) => `
    <article class="gallery-item reveal" role="listitem">
      <button class="gallery-btn"
              aria-label="Ver imagen ampliada: ${esc(img.alt)}"
              data-src="${esc(img.src)}"
              data-alt="${esc(img.alt)}">
        <img src="${esc(img.src)}"
             alt="${esc(img.alt)}"
             loading="${i < 3 ? 'eager' : 'lazy'}"
             width="400"
             height="400">
        <div class="gallery-overlay" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </div>
      </button>
    </article>
  `).join('');
}

/* ── 2. Header sticky + nav activo ── */
function initHeader() {
  const header    = document.getElementById('header');
  const navLinks  = document.querySelectorAll('.nav-link');
  const sections  = document.querySelectorAll('section[id]');
  const scrollTop = document.getElementById('scroll-top');

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 40);
    header.classList.toggle('transparent', y <= 40);
    if (scrollTop) scrollTop.hidden = y < 400;

    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${current}`;
      link.classList.toggle('active', active);
      active ? link.setAttribute('aria-current', 'page') : link.removeAttribute('aria-current');
    });
  }

  header.classList.add('transparent');
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── 3. Hamburger menu ── */
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const nav       = document.getElementById('nav-links');
  if (!hamburger || !nav) return;

  function close() {
    nav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  nav.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', close));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      close();
      hamburger.focus();
    }
  });
}

/* ── 4. Smooth scroll ── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - headerH, behavior: 'smooth' });
    });
  });
}

/* ── 5. Scroll to top ── */
function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (btn) btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── 6. Reveal on scroll (IntersectionObserver) ── */
function initReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal:not(.revealed)').forEach((el, i) => {
    const siblings = Array.from(el.parentElement.querySelectorAll('.reveal:not(.revealed)'));
    el.style.transitionDelay = `${siblings.indexOf(el) * 0.07}s`;
    observer.observe(el);
  });
}

/* ── 7. Contador animado ── */
function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length || !('IntersectionObserver' in window)) {
    counters.forEach(c => { c.textContent = c.dataset.target; });
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const start = performance.now();
      const duration = 1800;

      (function animate(now) {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
        if (p < 1) requestAnimationFrame(animate);
        else el.textContent = target;
      })(start);

      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* ── 8. Lightbox de galería ── */
function initLightbox() {
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lightbox-img');
  const closeBtn  = document.getElementById('lightbox-close');
  const backdrop  = document.getElementById('lightbox-backdrop');
  const prevBtn   = document.getElementById('lightbox-prev');
  const nextBtn   = document.getElementById('lightbox-next');
  if (!lightbox) return;

  const btns = Array.from(document.querySelectorAll('.gallery-btn'));
  let idx = 0, lastFocus = null;

  function open(i) {
    idx = i;
    const b = btns[idx];
    lbImg.src = b.dataset.src;
    lbImg.alt = b.dataset.alt || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    lastFocus = document.activeElement;
    closeBtn?.focus();
    updateNav();
  }

  function close() {
    lightbox.hidden = true;
    lbImg.src = lbImg.alt = '';
    document.body.style.overflow = '';
    lastFocus?.focus();
  }

  function updateNav() {
    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) nextBtn.disabled = idx === btns.length - 1;
  }

  btns.forEach((b, i) => b.addEventListener('click', () => open(i)));
  closeBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  prevBtn?.addEventListener('click', () => idx > 0 && open(idx - 1));
  nextBtn?.addEventListener('click', () => idx < btns.length - 1 && open(idx + 1));

  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight' && idx < btns.length - 1) open(idx + 1);
    if (e.key === 'ArrowLeft' && idx > 0) open(idx - 1);
  });

  let tx = 0;
  lightbox.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const d = tx - e.changedTouches[0].clientX;
    if (Math.abs(d) > 50) { if (d > 0 && idx < btns.length - 1) open(idx + 1); else if (d < 0 && idx > 0) open(idx - 1); }
  }, { passive: true });
}

/* ── 9. Parallax hero (solo desktop, sin reduce-motion) ── */
function initParallax() {
  const hero = document.querySelector('.hero');
  if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 992) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) hero.style.backgroundPositionY = `calc(center + ${y * 0.25}px)`;
  }, { passive: true });
}

/* ── 10. Netlify Identity redirect ── */
function initNetlifyIdentity() {
  if (window.netlifyIdentity) {
    window.netlifyIdentity.on('init', user => {
      if (!user) {
        window.netlifyIdentity.on('login', () => {
          document.location.href = '/admin/';
        });
      }
    });
  }
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  loadContent();
  initHeader();
  initHamburger();
  initSmoothScroll();
  initScrollTop();
  initReveal();
  initCounters();
  initParallax();
  initNetlifyIdentity();
});
