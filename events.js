import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

const savedTheme = localStorage.getItem("theme") || "light";
document.body.className = savedTheme;
document.querySelector(".theme-icon").textContent = savedTheme === "dark" ? "☀️" : "🌙";

window.toggleTheme = function() {
  const body = document.body;
  const icon = document.querySelector(".theme-icon");
  if (body.classList.contains("light")) {
    body.classList.replace("light", "dark"); icon.textContent = "☀️"; localStorage.setItem("theme", "dark");
  } else {
    body.classList.replace("dark", "light"); icon.textContent = "🌙"; localStorage.setItem("theme", "light");
  }
};

window.toggleMenu = function() {
  document.getElementById("mobileMenu").classList.toggle("open");
};

const months = ["Січня","Лютого","Березня","Квітня","Травня","Червня","Липня","Серпня","Вересня","Жовтня","Листопада","Грудня"];
let allEvents = [];

// ── АФІШІ ──
async function loadPosters() {
  const container = document.getElementById("postersGrid");
  try {
    const q = query(collection(db, "posters"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    if (snap.empty) { container.innerHTML = `<p style="color:var(--muted)">Афіші незабаром 🌸</p>`; return; }
    container.innerHTML = "";
    snap.docs.forEach(doc => {
      const p = doc.data();
      const div = document.createElement("div");
      div.className = "poster-card";
      div.innerHTML = `<img src="${p.imageUrl}" alt="${p.title}" loading="lazy"><div class="poster-card-info"><h4>${p.title}</h4><p>${p.date || ""}</p></div>`;
      container.appendChild(div);
    });
  } catch(e) { container.innerHTML = `<p style="color:var(--muted)">Помилка завантаження</p>`; console.error(e); }
}

// ── ПОДІЇ ──
async function loadEvents() {
  const container = document.getElementById("eventsGrid");
  try {
    const q = query(collection(db, "events"), orderBy("date", "desc"));
    const snap = await getDocs(q);
    if (snap.empty) { container.innerHTML = `<p style="color:var(--muted);padding:40px 0">Подій поки немає. Слідкуй за <a href="https://t.me/+fsPI-IEQICtlOTBi" target="_blank" style="color:var(--accent)">Telegram</a>!</p>`; return; }
    allEvents = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderEvents(allEvents);
  } catch(e) { container.innerHTML = `<p style="color:var(--muted)">Помилка завантаження</p>`; console.error(e); }
}

function renderEvents(list) {
  const container = document.getElementById("eventsGrid");
  const now = new Date();
  container.innerHTML = "";
  if (!list.length) { container.innerHTML = `<p style="color:var(--muted);padding:20px 0">Нічого не знайдено</p>`; return; }

  list.forEach(event => {
    const dt = new Date(event.date);
    const isPast = dt < now;
    const gradients = ["linear-gradient(135deg,#fde8f0,#f9c4d8)","linear-gradient(135deg,#f0e8fd,#d8c4f9)","linear-gradient(135deg,#e8f0fd,#c4d8f9)","linear-gradient(135deg,#fdf0e8,#f9d4c4)"];
    const emojis = ["🌸","🎨","🧘","🧺","📸","🍰"];
    const idx = Math.abs(event.title.charCodeAt(0)) % 4;

    const card = document.createElement("div");
    card.className = `event-card${isPast ? " event-past" : ""}`;
    card.dataset.category = event.category || "";
    card.innerHTML = `
      <div class="event-card-img">
        ${event.imageUrl
          ? `<img src="${event.imageUrl}" alt="${event.title}" loading="lazy">`
          : `<div class="event-card-img-placeholder" style="background:${gradients[idx]}">${emojis[idx]}</div>`}
      </div>
      <div class="event-card-body">
        <div class="event-badge">${event.category || "Подія"}${isPast ? " · Минула" : ""}</div>
        <h3>${event.title}</h3>
        <p>${event.description || ""}</p>
        <div class="event-meta">
          <span>🕐 ${dt.toLocaleTimeString("uk-UA", {hour:"2-digit",minute:"2-digit"})}</span>
          ${event.location ? `<span>📍 ${event.location}</span>` : ""}
          ${event.price ? `<span>🎟 ${event.price}</span>` : ""}
        </div>
        <div class="event-card-footer">
          <span class="event-card-date">${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}</span>
          ${!isPast ? `<a href="https://t.me/+fsPI-IEQICtlOTBi" target="_blank" class="btn-main">Йду ✅</a>` : ""}
        </div>
      </div>`;
    container.appendChild(card);
  });
}

window.filterEvents = function(category, btn) {
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  if (category === "all") { renderEvents(allEvents); return; }
  renderEvents(allEvents.filter(e => (e.category || "").includes(category)));
};

// ── ФОТО ──
async function loadPhotos() {
  const container = document.getElementById("photoGrid");
  try {
    const q = query(collection(db, "photos"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    if (snap.empty) {
      const placeholders = [["🌸","#f8c8d4","#f4a0b8"],["🎨","#fde8f0","#f9c4d8"],["🧺","#f0e8fd","#d8c4f9"],["✨","#e8f0fd","#c4d8f9"],["🧘","#fdf0e8","#f9d4c4"]];
      container.innerHTML = placeholders.map((p, i) =>
        `<div class="gallery-item${i===0?" g-big":""}"><div class="gallery-placeholder" style="background:linear-gradient(135deg,${p[1]},${p[2]})">${p[0]}</div></div>`
      ).join("");
      return;
    }
    container.innerHTML = "";
    snap.docs.forEach((doc, i) => {
      const p = doc.data();
      const div = document.createElement("div");
      div.className = `gallery-item${i===0?" g-big":""}`;
      div.innerHTML = `<img src="${p.imageUrl}" alt="${p.caption||""}" loading="lazy"><div class="gallery-overlay"><span>${p.caption||""}</span></div>`;
      container.appendChild(div);
    });
  } catch(e) { console.error(e); }
}

loadPosters();
loadEvents();
loadPhotos();
