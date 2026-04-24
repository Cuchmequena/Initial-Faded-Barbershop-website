'use strict';

const BOOKSY_URL = 'https://booksy.com/es-es/72058_faded-barbershop_barberia_53009_madrid';

/* ── Escape HTML ── */
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Cargar contenido ── */
async function loadContent() {
  const results = await Promise.allSettled([
    fetch('/_data/home.json').then(r => r.ok ? r.json() : null),
    fetch('/_data/services.json').then(r => r.ok ? r.json() : null),
    fetch('/_data/team.json').then(r => r.ok ? r.json() : null),
    fetch('/_data/gallery.json').then(r => r.ok ? r.json() : null),
    fetch('/_data/config.json').then(r => r.ok ? r.json() : null),
    fetch('/_data/seo.json').then(r => r.ok ? r.json() : null),
  ]);

  const [homeRes, servicesRes, teamRes, galleryRes, configRes, seoRes] = results;

  if (homeRes.value) applyHome(homeRes.value);
  if (configRes.value) applyConfig(configRes.value);
  if (seoRes.value) applySEO(seoRes.value);
  if (servicesRes.value) renderServices(servicesRes.value);
  if (teamRes.value) renderTeam(teamRes.value);
  if (galleryRes.value) renderGallery(galleryRes.value);
}

/* ── APLICAR HOME (AQUÍ ESTÁ EL FIX IMPORTANTE) ── */
function applyHome(h) {

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el && value) el.textContent = value;
  };

  /* HERO */
  setText('hero-eyebrow', h.hero_eyebrow);
  setText('hero-subtitle', h.hero_subtitle);

  /* WHY US (CLAVE DEL FIX) */
  setText('whyusBarbersNames', h.whyus_barbers_names);
  setText('whyusBarbersText', h.whyus_barbers_text);

  /* TEAM */
  setText('teamDesc', h.team_desc);

  /* SERVICIOS */
  setText('services-eyebrow', h.services_eyebrow);
  setText('services-title', h.services_title);
  setText('services-desc', h.services_desc);

  /* GALERÍA */
  setText('gallery-eyebrow', h.gallery_eyebrow);
  setText('gallery-title', h.gallery_title);
  setText('gallery-desc', h.gallery_desc);

  /* LOYALTY */
  if (h.loyalty_text) {
    const el = document.getElementById('loyalty-text');
    if (el) el.innerHTML = esc(h.loyalty_text).replace(/\n/g, '<br>');
  }

  if (h.loyalty_highlight) {
    const el = document.getElementById('loyalty-highlight');
    if (el) el.innerHTML = esc(h.loyalty_highlight);
  }

  setText('loyalty-sub', h.loyalty_sub);
}

/* ── CONFIG ── */
function applyConfig(cfg) {
  if (cfg.whatsapp_href) {
    document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
      a.href = cfg.whatsapp_href;
    });
  }
}

/* ── SEO ── */
function applySEO(s) {
  if (!s) return;
  if (s.site_title) document.title = s.site_title;
}

/* ── SERVICIOS ── */
function renderServices(data) {
  const container = document.getElementById('services-container');
  if (!container || !data.categories) return;

  container.innerHTML = data.categories.map(cat => `
    <div>
      <h3>${esc(cat.title)}</h3>
    </div>
  `).join('');
}

/* ── TEAM ── */
function renderTeam(data) {
  const container = document.getElementById('team-container');
  if (!container || !data.members) return;

  container.innerHTML = data.members.map(m => `
    <div>
      <h3>${esc(m.name)}</h3>
      <p>${esc(m.role)}</p>
    </div>
  `).join('');
}

/* ── GALERÍA ── */
function renderGallery(data) {
  const container = document.getElementById('gallery-container');
  if (!container || !data.images) return;

  container.innerHTML = data.images.map(img => `
    <img src="${esc(img.src)}" alt="${esc(img.alt)}">
  `).join('');
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', loadContent);