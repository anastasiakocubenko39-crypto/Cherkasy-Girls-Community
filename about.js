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

// ── КОМАНДА ──
async function loadTeam() {
  const container = document.getElementById("teamGrid");
  try {
    const q = query(collection(db, "team"), orderBy("order", "asc"));
    const snap = await getDocs(q);
    if (snap.empty) {
      container.innerHTML = `
        <div class="team-card"><div class="team-avatar">👑</div><div class="team-name">Анастасія</div><div class="team-role">Засновниця</div></div>
        <div class="team-card"><div class="team-avatar">🌸</div><div class="team-name">Додай в адмінці</div><div class="team-role">Роль</div></div>`;
      return;
    }
    container.innerHTML = "";
    snap.docs.forEach(doc => {
      const m = doc.data();
      const div = document.createElement("div");
      div.className = "team-card";
      div.innerHTML = `
        <div class="team-avatar">
          ${m.photoUrl ? `<img src="${m.photoUrl}" alt="${m.name}">` : m.emoji || "🌸"}
        </div>
        <div class="team-name">${m.name}</div>
        <div class="team-role">${m.role || ""}</div>`;
      container.appendChild(div);
    });
  } catch(e) { console.error(e); }
}

// ── ФОТО ──
async function loadPhotos() {
  const container = document.getElementById("photoGrid");
  try {
    const q = query(collection(db, "photos"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    if (snap.empty) {
      const ph = [["👯","#f8c8d4","#f4a0b8"],["🌸","#fde8f0","#f9c4d8"],["😊","#f0e8fd","#d8c4f9"],["💫","#e8f0fd","#c4d8f9"],["🤍","#fdf0e8","#f9d4c4"]];
      container.innerHTML = ph.map((p,i) =>
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

loadTeam();
loadPhotos();
