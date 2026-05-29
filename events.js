import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, query,
  orderBy, getDocs, where, limit
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyATAMeZCC69E0kaC0u9YBTMvzjI9qZudMc",
  authDomain: "girls-club-6160c.firebaseapp.com",
  projectId: "girls-club-6160c",
  storageBucket: "girls-club-6160c.firebasestorage.app",
  messagingSenderId: "492918751105",
  appId: "1:492918751105:web:3e8fc21d93ace0ef183280"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

const months = [
  "Січня","Лютого","Березня","Квітня","Травня","Червня",
  "Липня","Серпня","Вересня","Жовтня","Листопада","Грудня"
];

// ── НАЙБЛИЖЧА ПОДІЯ ──────────────────────────────────────
async function loadNextEvent() {
  const container = document.getElementById("nextEventCard");
  if (!container) return;

  try {
    const now = new Date().toISOString();

    let snap = await getDocs(
      query(
        collection(db, "events"),
        where("date", ">=", now),
        orderBy("date", "asc"),
        limit(1)
      )
    );

    // Якщо майбутніх немає — остання минула
    if (snap.empty) {
      snap = await getDocs(
        query(collection(db,"events"), orderBy("date","desc"), limit(1))
      );
    }

    if (snap.empty) {
      container.innerHTML = `
        <div style="padding:32px;text-align:center;color:var(--muted)">
          Найближчих подій поки немає. Слідкуй за 
          <a href="https://t.me/+QrrTYPiCMMQ2Mjky" target="_blank" style="color:var(--accent)">Telegram</a>! 🌸
        </div>`;
      return;
    }

    const event = snap.docs[0].data();
    const dt    = new Date(event.date);

    container.innerHTML = `
      <div class="next-event-card">
        <div class="event-date-big">
          <div class="event-day">${dt.getDate()}</div>
          <div class="event-month">${months[dt.getMonth()]}</div>
        </div>
        <div class="event-info">
          <div class="event-badge">${event.category || "Подія"}</div>
          <h3>${event.title || ""}</h3>
          <p>${event.description || ""}</p>
          <div class="event-meta">
            <span>🕐 ${dt.toLocaleTimeString("uk-UA",{hour:"2-digit",minute:"2-digit"})}</span>
            ${event.location ? `<span>📍 ${event.location}</span>` : ""}
            ${event.price    ? `<span>🎟 ${event.price}</span>`    : ""}
          </div>
          <a href="https://t.me/+QrrTYPiCMMQ2Mjky" target="_blank" class="btn-main">Йду ✅</a>
        </div>
        ${event.imageUrl
          ? `<img src="${event.imageUrl}" alt="${event.title}"
               style="width:240px;height:200px;object-fit:cover;border-radius:16px;flex-shrink:0">`
          : ""}
      </div>`;

  } catch(e) {
    console.error("loadNextEvent error:", e);
    container.innerHTML = `<div style="padding:32px;text-align:center;color:var(--muted)">Помилка завантаження</div>`;
  }
}

// ── ВСІ ПОДІЇ ────────────────────────────────────────────
async function loadAllEvents() {
  const container = document.getElementById("eventsGrid");
  if (!container) return;

  try {
    const snap = await getDocs(
      query(collection(db,"events"), orderBy("date","desc"))
    );

    if (snap.empty) {
      container.innerHTML = `
        <div style="padding:40px 0;color:var(--muted)">
          Подій поки немає. Слідкуй за 
          <a href="https://t.me/+QrrTYPiCMMQ2Mjky" target="_blank" style="color:var(--accent)">Telegram</a>!
        </div>`;
      return;
    }

    const now = new Date();
    container.innerHTML = "";

    snap.docs.forEach(doc => {
      const e    = doc.data();
      const dt   = new Date(e.date);
      const past = dt < now;

      const card = document.createElement("div");
      card.className = `event-card${past ? " event-past" : ""}`;
      card.innerHTML = `
        <div class="event-card-img">
          ${e.imageUrl
            ? `<img src="${e.imageUrl}" alt="${e.title}" loading="lazy">`
            : `<div class="event-card-img-placeholder">🌸</div>`}
        </div>
        <div class="event-card-body">
          <div class="event-badge">${e.category || "Подія"}${past ? " · Минула" : ""}</div>
          <h3>${e.title || ""}</h3>
          <p>${e.description || ""}</p>
          <div class="event-meta">
            <span>🕐 ${dt.toLocaleTimeString("uk-UA",{hour:"2-digit",minute:"2-digit"})}</span>
            ${e.location ? `<span>📍 ${e.location}</span>` : ""}
            ${e.price    ? `<span>🎟 ${e.price}</span>`    : ""}
          </div>
          <div class="event-card-footer">
            <span class="event-card-date">
              ${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}
            </span>
            ${!past
              ? `<a href="https://t.me/+QrrTYPiCMMQ2Mjky" target="_blank" class="btn-main">Йду ✅</a>`
              : ""}
          </div>
        </div>`;
      container.appendChild(card);
    });

  } catch(e) {
    console.error("loadAllEvents error:", e);
    container.innerHTML = `<div style="padding:20px;color:var(--muted)">Помилка завантаження</div>`;
  }
}

// ── ЗАПУСК ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadNextEvent();
  loadAllEvents();
  document.getElementById("year") &&
    (document.getElementById("year").textContent = new Date().getFullYear());
});
