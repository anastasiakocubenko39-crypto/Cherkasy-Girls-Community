/* ELARIE — спільна шапка, меню, футер і анімації */
(function () {
  const GROUP = 'https://t.me/+sc80r1PWtEMzNmE6';
  const EVENTS_CHAT = 'https://t.me/+QrrTYPiCMMQ2Mjky';
  const FOUNDER = 'https://t.me/anastasiyahhhhh';
  window.ELARIE = { GROUP, EVENTS_CHAT, FOUNDER };
  document.documentElement.classList.add('js');

  const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
  window.ELARIE.arrow = arrow;
  const page = document.body.dataset.page || '';
  const links = [
    ['index.html', 'Головна', 'home'],
    ['women-journal.html', 'Журнал', 'journal'],
    ['events.html', 'Зустрічі', 'events'],
    ['about.html', 'Про клуб', 'about'],
  ];
  const nav = links.map(([h, t, k]) => `<a href="${h}"${k === page ? ' aria-current="page"' : ''}>${t}</a>`).join('');
  const brand = `<a class="brand" href="index.html" aria-label="ELARIE — на головну"><img src="assets/logo.svg" alt="" width="40" height="40"><span><b>ELARIE</b><small>жіночий клуб · Черкаси</small></span></a>`;

  document.body.insertAdjacentHTML('afterbegin', `
    <div class="progress" aria-hidden="true"></div>
    <header class="hdr"><div class="wrap">${brand}<nav class="nav" aria-label="Головне меню">${nav}</nav>
      <a class="btn" href="${GROUP}" target="_blank" rel="noopener">Вступити в клуб ${arrow}</a>
      <button class="burger" aria-label="Меню" aria-expanded="false"><span></span><span></span></button></div></header>
    <nav class="drawer" aria-label="Мобільне меню">${nav}<a class="btn light" href="${GROUP}" target="_blank" rel="noopener">Вступити в клуб ${arrow}</a></nav>`);

  document.body.insertAdjacentHTML('beforeend', `
    <footer class="ftr"><div class="wrap">
      <div class="ftr-grid">
        <div>${brand}<p>Жіночий клуб і онлайн-журнал Черкас. Зустрічі, підтримка, натхнення і нові подруги — у колі, де можна бути собою.</p></div>
        <div><h5>Клуб</h5><ul><li><a href="about.html">Про клуб</a></li><li><a href="events.html">Зустрічі</a></li><li><a href="${GROUP}" target="_blank" rel="noopener">Вступити</a></li></ul></div>
        <div><h5>Журнал</h5><ul><li><a href="women-journal.html#psychology">Психологія</a></li><li><a href="women-journal.html#health">Здоров'я</a></li><li><a href="women-journal.html#moms">Для мам</a></li><li><a href="games.html">Дитячі ігри</a></li></ul></div>
        <div><h5>Зв'язок</h5><ul><li><a href="${GROUP}" target="_blank" rel="noopener">Telegram-спільнота</a></li><li><a href="${EVENTS_CHAT}" target="_blank" rel="noopener">Чат зустрічей</a></li><li><a href="${FOUNDER}" target="_blank" rel="noopener">Написати засновниці</a></li></ul></div>
      </div>
      <div class="ftr-big" aria-hidden="true">ELARIE</div>
      <div class="ftr-bottom"><span>© ${new Date().getFullYear()} ELARIE · Черкаси</span><span>Жінки. Підтримка. Дружба. Натхнення.</span></div>
    </div></footer>`);

  // menu
  const burger = document.querySelector('.burger');
  const toggle = (open) => { document.body.classList.toggle('menu-open', open); burger.setAttribute('aria-expanded', open); };
  burger.addEventListener('click', () => toggle(!document.body.classList.contains('menu-open')));
  document.querySelectorAll('.drawer a').forEach((a) => a.addEventListener('click', () => toggle(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') toggle(false); });

  // secret admin entrance: 5 taps on the logo
  let taps = 0, tt;
  document.querySelector('.hdr .brand').addEventListener('click', (e) => {
    taps++; clearTimeout(tt); tt = setTimeout(() => (taps = 0), 1600);
    if (taps >= 5) { e.preventDefault(); location.href = 'admin.html'; }
    else if (taps > 1) e.preventDefault();
  });

  // header + progress + parallax
  const hdr = document.querySelector('.hdr');
  const bar = document.querySelector('.progress');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lastY = 0, ticking = false;
  const onScroll = () => {
    const y = scrollY;
    hdr.classList.toggle('solid', y > 20);
    const hidden = y > 400 && y > lastY && !document.body.classList.contains('menu-open');
    hdr.classList.toggle('hide', hidden);
    document.body.classList.toggle('hdr-hidden', hidden);
    lastY = y;
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    if (!reduce) document.querySelectorAll('[data-parallax]').forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      el.style.transform = `translate3d(0, ${(-p * (parseFloat(el.dataset.parallax) || 60)).toFixed(1)}px, 0)`;
    });
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  // split headings into words
  window.ELARIE.split = (root = document) => root.querySelectorAll('.split-words:not([data-done])').forEach((el) => {
    el.dataset.done = 1;
    let i = 0;
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(' '); return; }
          const w = document.createElement('span'); w.className = 'w';
          const s = document.createElement('span'); s.textContent = part; s.style.setProperty('--i', i++);
          w.append(s); frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
    walk(el);
  });
  window.ELARIE.split();

  // reveal on scroll (masks are observed through their parent, clip-path hides them from the observer)
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    [e.target, ...(e.target._rv || [])].forEach((el) => el.classList.add('in'));
    io.unobserve(e.target);
  }), { rootMargin: '0px 0px -8% 0px', threshold: .05 }) : null;
  window.ELARIE.reveal = (root = document) => root.querySelectorAll('.rv, .rv-mask, .split-words').forEach((el) => {
    if (el.classList.contains('in') || el._rvDone) return;
    el._rvDone = true;
    if (!io) return el.classList.add('in');
    const t = el.classList.contains('rv-mask') ? el.parentElement : el;
    if (t !== el) { (t._rv ||= []).push(el); }
    io.observe(t);
  });
  window.ELARIE.reveal();
})();
