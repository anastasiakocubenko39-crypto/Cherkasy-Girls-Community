/* ELARIE — Firebase і спільні помічники */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
export * from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const app = initializeApp({
  apiKey: 'AIzaSyATAMeZCC69E0kaC0u9YBTMvzjI9qZudMc',
  authDomain: 'girls-club-6160c.firebaseapp.com',
  projectId: 'girls-club-6160c',
  storageBucket: 'girls-club-6160c.firebasestorage.app',
  messagingSenderId: '492918751105',
  appId: '1:492918751105:web:3e8fc21d93ace0ef183280',
});
export const db = getFirestore(app);

export const MONTHS = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
export const MONTHS_SHORT = ['січ', 'лют', 'бер', 'кві', 'тра', 'чер', 'лип', 'сер', 'вер', 'жов', 'лис', 'гру'];

// прибирає емодзі з текстів, що приходять з бази
const EMOJI = /(?:\p{Extended_Pictographic}|\p{Regional_Indicator}|[\u{1F3FB}-\u{1F3FF}\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}])/gu;
export const clean = (s) => String(s ?? '')
  .replace(EMOJI, '')
  .replace(/[ \t]{2,}/g, ' ')
  .replace(/^[ \t]+|[ \t]+$/gm, '')
  .replace(/\n{3,}/g, '\n\n')
  .trim();
export const esc = (s) => clean(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const safeUrl = (u) => { if (!u || !String(u).trim()) return ''; try { const x = new URL(String(u || ''), location.href); return /^https?:$/.test(x.protocol) ? x.href.replace(/"/g, '%22') : ''; } catch { return ''; } };
export const toDate = (v) => (v?.toDate ? v.toDate() : v?.seconds ? new Date(v.seconds * 1000) : v ? new Date(v) : null);

// дата події: якщо час не вказано (північ UTC) — показуємо лише дату
export function evDate(v) {
  const d = new Date(v);
  if (isNaN(d)) return null;
  const noTime = d.getUTCHours() === 0 && d.getUTCMinutes() === 0;
  return {
    day: noTime ? d.getUTCDate() : d.getDate(),
    month: noTime ? d.getUTCMonth() : d.getMonth(),
    year: noTime ? d.getUTCFullYear() : d.getFullYear(),
    time: noTime ? '' : d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
  };
}

export const ICONS = {
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  ticket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 8a2 2 0 0 0 0 4v0a2 2 0 0 1 0 4v2h18v-2a2 2 0 0 1 0-4 2 2 0 0 0 0-4V6H3z"/><path d="M14 6v12" stroke-dasharray="2 2"/></svg>',
};

export function eventHTML(e, { cta = true } = {}) {
  const dt = evDate(e.date);
  const img = safeUrl(e.imageUrl);
  return `<article class="event rv">
    <div class="event-date">${dt ? `<b>${dt.day}</b><span>${MONTHS[dt.month]}</span><small>${dt.year}</small>` : '<span>Скоро</span>'}</div>
    <div>
      <span class="tag">${esc(e.category) || 'Зустріч'}</span>
      <h3>${esc(e.title)}</h3>
      ${e.description ? `<p class="clamp">${esc(e.description)}</p>${clean(e.description).length > 260 ? '<button class="more-btn" onclick="this.previousElementSibling.classList.toggle(\'open\');this.textContent=this.previousElementSibling.classList.contains(\'open\')?\'Згорнути\':\'Читати повністю\'">Читати повністю</button>' : ''}` : ''}
      <div class="meta">
        ${dt?.time ? `<span>${ICONS.clock}${dt.time}</span>` : ''}
        ${e.location ? `<span>${ICONS.pin}${esc(e.location)}</span>` : ''}
        ${e.price ? `<span>${ICONS.ticket}${esc(e.price)}</span>` : ''}
      </div>
      ${cta ? `<a class="btn" href="${window.ELARIE.EVENTS_CHAT}" target="_blank" rel="noopener">Я йду ${window.ELARIE.arrow}</a>` : ''}
    </div>
    ${img ? `<img class="event-img" src="${img}" alt="" loading="lazy" onerror="this.remove()">` : ''}
  </article>`;
}

export async function nextEvent() {
  const snap = await getDocs(collection(db, 'events'));
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((e) => !isNaN(new Date(e.date)));
  const now = Date.now() - 864e5; // подія вважається актуальною до кінця дня
  const future = list.filter((e) => +new Date(e.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date));
  const past = list.filter((e) => +new Date(e.date) < now).sort((a, b) => new Date(b.date) - new Date(a.date));
  return { all: [...future, ...past], next: future[0] || null, last: past[0] || null };
}
