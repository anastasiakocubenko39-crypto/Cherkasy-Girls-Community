/* ELARIE — логіка журналу: рубрики, пошук, читалка */
import { db, collection, getDocs, esc, clean, safeUrl, toDate } from './fb.js';
import { CATS, CAT, cardHTML, subLabel } from './journal-data.js';

const E = window.ELARIE;
const $ = (id) => document.getElementById(id);
const state = { cat: 'all', sub: 'all', q: '' };
let ARTICLES = [];
const blocksCache = {};

const EXTRA = {
  moms: `<a class="promo-game rv" href="games.html"><div><span class="tag">Для малечі</span><h3>Дитяча академія</h3><p>Інтерактивні ігри: букви, цифри, математика і пам'ять.</p></div><span class="btn">Грати ${E.arrow}</span></a>`,
  cooking: '<div id="bju-calc-wrap" class="rv"></div>',
  rights: `<h3 class="h3 rv">Безкоштовна допомога в Україні</h3><div class="info rv">
    <div><h4>Психологічна підтримка</h4><p><a href="tel:7333">7333</a> — Lifeline Ukraine, цілодобово<br><a href="tel:0800100102">0 800 100 102</a> — Нац. психологічна асоціація<br><a href="tel:0800501701">0 800 501 701</a> — Всеукр. телефон довіри<br><a href="tel:0800211444">0 800 211 444</a> — Підтримка МОМ<br><a href="tel:0800210160">0 800 210 160</a> — «Людина в біді»</p></div>
    <div><h4>Домашнє насильство</h4><p><a href="tel:1547">1547</a> — Державна гаряча лінія<br><a href="tel:0800500335">0 800 500 335</a> — La Strada Україна<br><a href="tel:116123">116 123</a> — La Strada, з мобільного<br><a href="tel:102">102</a> — Поліція</p></div>
    <div><h4>Права і дискримінація</h4><p><a href="tel:1678">1678</a> — Омбудсман ВРУ<br><a href="tel:0800501720">0 800 501 720</a> — Гаряча лінія Омбудсмана<br><a href="tel:102">102</a> — Поліція</p></div>
    <div><h4>Булінг і допомога дітям</h4><p><a href="tel:116111">116 111</a> — Нац. дитяча гаряча лінія<br><a href="tel:0800100898">0 800 100 898</a> — МОН України</p></div>
    <div><h4>Юридична допомога</h4><p><a href="tel:0800213103">0 800 213 103</a> — Безоплатна правова допомога</p></div>
    <div><h4>Екстрені служби</h4><p><a href="tel:101">101</a> — ДСНС · <a href="tel:102">102</a> — Поліція<br><a href="tel:103">103</a> — Швидка · <a href="tel:112">112</a> — Єдиний номер</p></div>
  </div>`,
  volunteer: `<h3 class="h3 rv">Перевірені фонди України</h3><div class="funds rv">
    <a class="fund" href="https://share.google/HfbP2uCUyhUWJ3B7c" target="_blank" rel="noopener"><b>Gurtum Charity Foundation</b><span>Фонд діючих військових ДПСУ</span></a>
    <a class="fund" href="https://savelife.in.ua" target="_blank" rel="noopener"><b>Повернись живим</b><span>savelife.in.ua</span></a>
    <a class="fund" href="https://u24.gov.ua" target="_blank" rel="noopener"><b>UNITED24</b><span>u24.gov.ua</span></a>
    <a class="fund" href="https://prytulafoundation.org" target="_blank" rel="noopener"><b>Фонд Притули</b><span>prytulafoundation.org</span></a>
    <a class="fund" href="https://hospitallers.life" target="_blank" rel="noopener"><b>Госпітальєри</b><span>hospitallers.life</span></a>
    <a class="fund" href="https://aerorozvidka.xyz" target="_blank" rel="noopener"><b>Аеророзвідка</b><span>aerorozvidka.xyz</span></a>
  </div>`,
};

/* ── tabs ── */
const tabs = $('tabs');
tabs.insertAdjacentHTML('beforeend', [{ id: 'all', title: 'Усі' }, ...CATS].map((c) =>
  `<button class="tab" role="tab" data-cat="${c.id}" aria-selected="false">${c.title}</button>`).join(''));
const movePill = () => {
  const t = tabs.querySelector('[aria-selected="true"]');
  if (!t) return;
  $('pill').style.width = t.offsetWidth + 'px';
  $('pill').style.transform = `translateX(${t.offsetLeft}px)`;
};
addEventListener('resize', movePill);
tabs.addEventListener('click', (e) => {
  const b = e.target.closest('.tab');
  if (!b) return;
  history.replaceState(null, '', b.dataset.cat === 'all' ? location.pathname : '#' + b.dataset.cat);
  setCat(b.dataset.cat, true);
});

function setCat(cat, scroll) {
  if (cat !== 'all' && !CAT[cat]) cat = 'all';
  state.cat = cat; state.sub = 'all';
  tabs.querySelectorAll('.tab').forEach((t) => t.setAttribute('aria-selected', t.dataset.cat === cat));
  const t = tabs.querySelector(`[data-cat="${cat}"]`);
  t.scrollIntoView({ inline: 'center', block: 'nearest', behavior: scroll ? 'smooth' : 'auto' });
  requestAnimationFrame(movePill);
  const c = CAT[cat];
  $('catTitle').innerHTML = c ? esc(c.title) : 'Усі статті';
  $('catNote').textContent = c ? c.note : 'Найсвіжіші матеріали з усіх рубрик журналу';
  $('chips').innerHTML = c ? [['all', 'Усі'], ...c.subs].map(([k, l]) =>
    `<button class="chip" data-sub="${k}" aria-pressed="${k === 'all'}">${l}</button>`).join('') : '';
  $('extra').innerHTML = EXTRA[cat] || '';
  if (cat === 'cooking' && typeof window.initCalcUI === 'function') {
    window.initCalcUI('bju-calc-wrap');
    stripEmoji($('extra'));
  }
  E.reveal($('extra'));
  render();
  if (scroll) {
    const top = document.querySelector('.jbody').getBoundingClientRect().top + scrollY - 140;
    if (scrollY > top) scrollTo({ top, behavior: 'smooth' });
  }
}

$('chips').addEventListener('click', (e) => {
  const b = e.target.closest('.chip');
  if (!b) return;
  state.sub = b.dataset.sub;
  $('chips').querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', c === b));
  render();
});

let qt;
$('q').addEventListener('input', (e) => {
  clearTimeout(qt);
  qt = setTimeout(() => { state.q = e.target.value.trim().toLowerCase(); render(); }, 160);
});

/* ── render ── */
function render() {
  const grid = $('grid');
  let list = ARTICLES;
  if (state.q) list = list.filter((a) => (clean(a.title) + ' ' + clean(a.excerpt) + ' ' + subLabel(a.category, a.subcategory)).toLowerCase().includes(state.q));
  else if (state.cat !== 'all') list = list.filter((a) => a.category === state.cat && (state.sub === 'all' || a.subcategory === state.sub));
  $('count').textContent = state.q ? `знайдено: ${list.length}` : list.length ? `${list.length} ${plural(list.length)}` : '';
  if (state.q) { $('catTitle').textContent = 'Результати пошуку'; $('catNote').textContent = `За запитом «${state.q}»`; }
  else if (state.cat === 'all') $('catTitle').textContent = 'Усі статті';
  grid.className = 'cards' + (state.cat === 'all' && !state.q && list.length > 4 ? ' feature' : '');
  grid.innerHTML = list.length ? list.map(cardHTML).join('') : `<div class="empty">${state.q ? 'Нічого не знайдено. Спробуйте інше слово.' : 'У цій рубриці скоро з\'являться нові матеріали.'}</div>`;
  E.reveal(grid);
}
const plural = (n) => (n % 10 === 1 && n % 100 !== 11 ? 'стаття' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'статті' : 'статей');

$('grid').addEventListener('click', (e) => {
  const c = e.target.closest('.card');
  if (c) location.hash = 'a/' + c.dataset.id;
});

/* ── reader ── */
const reader = $('reader');
async function openArticle(id) {
  const a = ARTICLES.find((x) => x.id === id);
  if (!a) return;
  const cover = safeUrl(a.coverImageUrl || a.imageUrl);
  $('rCover').hidden = !cover;
  if (cover) $('rCover').src = cover;
  $('rTag').textContent = subLabel(a.category, a.subcategory) || CAT[a.category]?.title || '';
  $('rTitle').textContent = clean(a.title);
  $('rBody').innerHTML = '<div class="skeleton" style="min-height:220px"></div>';
  const links = [
    [a.website, 'Перейти на сайт', 'main'], [a.instagram, 'Instagram'], [a.telegram, 'Telegram'], [a.tiktok, 'TikTok'], [a.monoUrl, 'Підтримати', 'main'],
  ].filter(([u]) => safeUrl(u));
  $('rLinks').hidden = !links.length;
  $('rLinks').innerHTML = links.map(([u, t, c]) => `<a class="${c || ''}" href="${safeUrl(u)}" target="_blank" rel="noopener">${t}</a>`).join('');
  reader.classList.add('open'); reader.setAttribute('aria-hidden', 'false');
  document.body.classList.add('reader-open');
  reader.querySelector('.reader-panel').scrollTop = 0;
  reader.querySelector('.reader-close').focus({ preventScroll: true });

  const para = (t) => clean(t).split(/\n{2,}/).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join('');
  let html = '';
  if (a.category !== 'promo') {
    let blocks = blocksCache[id];
    if (!blocks) {
      try {
        const snap = await getDocs(collection(db, 'journal_articles', id, 'blocks'));
        blocks = blocksCache[id] = snap.docs.map((d) => d.data()).sort((x, y) => (x.order || 0) - (y.order || 0));
      } catch (err) { console.error(err); blocks = []; }
    }
    html = blocks.map((b) => (safeUrl(b.imageUrl) ? `<img src="${safeUrl(b.imageUrl)}" alt="" loading="lazy" onerror="this.remove()">` : '') + (b.text ? para(b.text) : '')).join('');
  }
  if (!html) html = para(a.content || a.excerpt || '') || '<p>Текст статті готується.</p>';
  if (reader.classList.contains('open')) $('rBody').innerHTML = html;
}
function closeReader() {
  reader.classList.remove('open'); reader.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('reader-open');
}
reader.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) location.hash = state.cat; });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && reader.classList.contains('open')) reader.querySelector('.reader-close').click(); });

/* ── routing ── */
function route(first) {
  const h = decodeURIComponent(location.hash.slice(1));
  if (h.startsWith('a/')) {
    const a = ARTICLES.find((x) => x.id === h.slice(2));
    if (first && a) setCat(a.category);
    openArticle(h.slice(2));
  } else {
    closeReader();
    if ((h || 'all') !== state.cat || first) setCat(h || 'all', !first);
  }
}
addEventListener('hashchange', () => route(false));

/* ── strip emojis inside calculator output ── */
function stripEmoji(root) {
  const fix = () => {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) { const t = w.currentNode.textContent; const c = t.replace(/(?:\p{Extended_Pictographic}|️)/gu, ''); if (c !== t) w.currentNode.textContent = c; }
  };
  fix();
  new MutationObserver(fix).observe(root, { childList: true, subtree: true });
}

/* ── load ── */
setCat('all');
let failed = false;
try {
  const [art, promo] = await Promise.all([getDocs(collection(db, 'journal_articles')), getDocs(collection(db, 'promo_posts'))]);
  ARTICLES = [
    ...art.docs.map((d) => ({ id: d.id, ...d.data() })).filter((a) => !a.status || a.status === 'published'),
    ...promo.docs.map((d) => { const p = d.data(); return { ...p, id: d.id, category: 'promo', subcategory: p.category || '', excerpt: p.shortDesc || '', content: p.content || '', coverImageUrl: p.imageUrl || '' }; }),
  ].sort((a, b) => (toDate(b.publishedAt || b.createdAt) || 0) - (toDate(a.publishedAt || a.createdAt) || 0));
} catch (err) {
  console.error(err);
  failed = true;
  $('grid').innerHTML = '<div class="empty">Не вдалося завантажити статті. Перевірте з\'єднання та оновіть сторінку.</div>';
}
if (!failed) route(true);
