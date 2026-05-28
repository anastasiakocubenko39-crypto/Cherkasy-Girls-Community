// ══════════════════════════════════════
//  CGC — Cherkasy Girls Club
//  Main Script
// ══════════════════════════════════════

document.addEventListener('DOMContentLoaded', function () {

  // ── YEAR ──
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── THEME ──
  const savedTheme = localStorage.getItem('cgc-theme') || 'light';
  applyTheme(savedTheme);

  // ── HEADER SCROLL ──
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // ── ARTICLE FILTER (journal) ──
  // handled inline via filterCat()

  // ── SCROLL REVEAL ──
  const revealEls = document.querySelectorAll(
    '.feature-card, .vm-card, .jp-card, .article-card, .poster-card, .gallery-item'
  );
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = `opacity 0.55s ease ${i * 0.06}s, transform 0.55s ease ${i * 0.06}s`;
      observer.observe(el);
    });
  }

});

// ── THEME TOGGLE ──
function applyTheme(theme) {
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(theme);
  const icon = document.querySelector('.theme-icon');
  if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const current = document.body.classList.contains('dark') ? 'dark' : 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('cgc-theme', next);
}

// ── MOBILE MENU ──
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('menuOverlay');
  if (!menu) return;
  const isOpen = menu.classList.toggle('open');
  overlay.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeMenu() {
  const menu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('menuOverlay');
  if (!menu) return;
  menu.classList.remove('open');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// ── JOURNAL CATEGORY FILTER ──
function filterCat(btn) {
  const cat = btn.dataset.cat;

  // update active button
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // filter articles
  const articles = document.querySelectorAll('.article-card');
  articles.forEach(card => {
    if (cat === 'all' || card.dataset.cat === cat) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}
