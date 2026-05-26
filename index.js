import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, limit, getDocs, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyATAMeZCC69E0kaC0u9YBTMvzjI9qZudMc",
  authDomain: "girls-club-6160c.firebaseapp.com",
  projectId: "girls-club-6160c",
  storageBucket: "girls-club-6160c.firebasestorage.app",
  messagingSenderId: "492918751105",
  appId: "1:492918751105:web:3e8fc21d93ace0ef183280"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.getElementById("year").textContent = new Date().getFullYear();

// ── THEME ──
function toggleTheme() {
  const body = document.body;
  const icon = document.querySelector(".theme-icon");
  if (body.classList.contains("light")) {
    body.classList.replace("light", "dark");
    icon.textContent = "☀️";
    localStorage.setItem("theme", "dark");
  } else {
    body.classList.replace("dark", "light");
    icon.textContent = "🌙";
    localStorage.setItem("theme", "light");
  }
}
window.toggleTheme = toggleTheme;

const savedTheme = localStorage.getItem("theme") || "light";
document.body.className = savedTheme;
document.querySelector(".theme-icon").textContent = savedTheme === "dark" ? "☀️" : "🌙";

// ── MOBILE MENU ──
window.toggleMenu = function() {
  document.getElementById("mobileMenu").classList.toggle("open");
};

// ── НАЙБЛИЖЧА ПОДІЯ ──
async function loadNextEvent() {
  const container = document.getElementById("nextEvent");
  try {
    const now = new Date().toISOString();
    const q = query(
      collection(db, "events"),
      where("date", ">=", now),
      orderBy("date", "asc"),
      limit(1)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      container.innerHTML = `<p style="color:var(--muted);padding:20px">Найближчих подій поки немає. Слідкуй за нашим <a href="https://t.me/+fsPI-IEQICtlOTBi" target="_blank" style="color:var(--accent)">Telegram</a>!</p>`;
      return;
    }

    const event = snap.docs[0].data();
    const dt = new Date(event.date);
    const months = ["Січня","Лютого","Березня","Квітня","Травня","Червня","Липня","Серпня","Вересня","Жовтня","Листопада","Грудня"];

    container.innerHTML = `
      <div class="event-date-big">
        <div class="event-day">${dt.getDate()}</div>
        <div class="event-month">${months[dt.getMonth()]}</div>
      </div>
      <div class="event-info">
        <div class="event-badge">${event.category || "Подія"}</div>
        <h3>${event.title}</h3>
        <p>${event.description || ""}</p>
        <div class="event-meta">
          <span>🕐 ${dt.toLocaleTimeString("uk-UA", {hour:"2-digit",minute:"2-digit"})}</span>
          ${event.location ? `<span>📍 ${event.location}</span>` : ""}
          ${event.price ? `<span>🎟 ${event.price}</span>` : ""}
        </div>
        <a href="events.html" class="btn-main">Детальніше</a>
      </div>`;
  } catch(e) {
    container.innerHTML = `<p style="color:var(--muted);padding:20px">Помилка завантаження</p>`;
    console.error(e);
  }
}

// ── АФІШІ ──
async function loadPosters() {
  const container = document.getElementById("postersGrid");
  try {
    const q = query(collection(db, "posters"), orderBy("createdAt", "desc"), limit(4));
    const snap = await getDocs(q);

    if (snap.empty) {
      container.innerHTML = `<p style="color:var(--muted)">Афіші незабаром з'являться 🌸</p>`;
      return;
    }

    container.innerHTML = "";
    snap.docs.forEach(doc => {
      const p = doc.data();
      const div = document.createElement("div");
      div.className = "poster-card";
      div.innerHTML = `
        <img src="${p.imageUrl}" alt="${p.title}" loading="lazy" onerror="this.style.display='none'">
        <div class="poster-card-info">
          <h4>${p.title}</h4>
          <p>${p.date || ""}</p>
        </div>`;
      container.appendChild(div);
    });
  } catch(e) {
    container.innerHTML = `<p style="color:var(--muted)">Помилка завантаження</p>`;
    console.error(e);
  }
}

// ── ФОТО ──
async function loadPhotos() {
  const container = document.getElementById("photoGrid");
  try {
    const q = query(collection(db, "photos"), orderBy("createdAt", "desc"), limit(5));
    const snap = await getDocs(q);

    if (snap.empty) {
      container.innerHTML = `
        <div class="gallery-item g-big"><div class="gallery-placeholder">🌸</div></div>
        <div class="gallery-item"><div class="gallery-placeholder">🎨</div></div>
        <div class="gallery-item"><div class="gallery-placeholder">🧺</div></div>
        <div class="gallery-item"><div class="gallery-placeholder">✨</div></div>
        <div class="gallery-item"><div class="gallery-placeholder">🧘</div></div>`;
      return;
    }

    container.innerHTML = "";
    snap.docs.forEach((doc, i) => {
      const p = doc.data();
      const div = document.createElement("div");
      div.className = `gallery-item${i === 0 ? " g-big" : ""}`;
      div.innerHTML = `
        <img src="${p.imageUrl}" alt="${p.caption || ""}" loading="lazy">
        <div class="gallery-overlay"><span>${p.caption || ""}</span></div>`;
      container.appendChild(div);
    });
  } catch(e) {
    console.error(e);
  }
}

loadNextEvent();
loadPosters();
loadPhotos();
