import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, query, orderBy,
  limit, getDocs, where
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
  const container = document.getElementById("nextEvent");
  if (!container) return;

  try {
    const now = new Date().toISOString();

    // Спочатку шукаємо майбутні події
    let snap = await getDocs(
      query(
        collection(db, "events"),
        where("date", ">=", now),
        orderBy("date", "asc"),
        limit(1)
      )
    );

    // Якщо майбутніх немає — показуємо останню минулу
    if (snap.empty) {
      snap = await getDocs(
        query(
          collection(db, "events"),
          orderBy("date", "desc"),
          limit(1)
        )
      );
    }

    if (snap.empty) {
      container.innerHTML = `
        <div style="padding:32px;text-align:center;color:var(--muted)">
          Найближчих подій поки немає. 
          Слідкуй за <a href="https://t.me/+QrrTYPiCMMQ2Mjky" target="_blank" style="color:var(--accent)">Telegram</a>! 🌸
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
          <a href="events.html" class="btn-main">Детальніше →</a>
        </div>
        ${event.imageUrl ? `<img src="${event.imageUrl}" alt="${event.title}" style="width:220px;height:180px;object-fit:cover;border-radius:16px;flex-shrink:0">` : ""}
      </div>`;

  } catch(e) {
    console.error("loadNextEvent error:", e);
    container.innerHTML = `
      <div style="padding:32px;text-align:center;color:var(--muted)">
        Помилка завантаження. Спробуй оновити сторінку.
      </div>`;
  }
}

// ── ЗАПУСК ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadNextEvent();
  document.getElementById("year") &&
    (document.getElementById("year").textContent = new Date().getFullYear());
});
