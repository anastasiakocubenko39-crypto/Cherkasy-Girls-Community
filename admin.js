import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, deleteDoc, doc,
  getDocs, query, orderBy, serverTimestamp
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

const ADMIN_PASSWORD = "123456789";

// ── СЕСІЯ ──
if (sessionStorage.getItem("cgc_admin") === "true") {
  showAdminPage();
}

window.doLogin = function() {
  const pass = document.getElementById("passInput").value.trim();
  const err  = document.getElementById("loginError");
  if (pass === ADMIN_PASSWORD) {
    sessionStorage.setItem("cgc_admin", "true");
    showAdminPage();
  } else {
    err.textContent = "Невірний пароль";
    document.getElementById("passInput").style.borderColor = "#e86f6f";
    setTimeout(() => document.getElementById("passInput").style.borderColor = "", 1000);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const p = document.getElementById("passInput");
  if (p) p.addEventListener("keydown", e => { if (e.key === "Enter") window.doLogin(); });
});

window.doLogout = function() { sessionStorage.removeItem("cgc_admin"); location.reload(); };

function showAdminPage() {
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("adminPage").classList.remove("hidden");
  loadAllData();
}

// ── TABS ──
window.showTab = function(name) {
  document.querySelectorAll(".admin-tab").forEach(t => t.classList.add("hidden"));
  document.querySelectorAll(".sidebar-btn").forEach(b => b.classList.remove("active"));
  document.getElementById(`tab-${name}`).classList.remove("hidden");
  document.getElementById(`nav-${name}`).classList.add("active");
};

// ── MODALS ──
window.openModal  = function(id) { document.getElementById(id).classList.remove("hidden"); };
window.closeModal = function(id) {
  document.getElementById(id).classList.add("hidden");
};
document.addEventListener("click", e => {
  if (e.target.classList.contains("modal")) closeModal(e.target.id);
});

// ── URL PREVIEW ──
window.previewUrl = function(inputId, previewId) {
  const url     = document.getElementById(inputId).value.trim();
  const preview = document.getElementById(previewId);
  if (url) {
    preview.src = url;
    preview.classList.remove("hidden");
    preview.onerror = () => preview.classList.add("hidden");
  } else {
    preview.classList.add("hidden");
  }
};

// ── TOAST ──
function toast(msg, type = "success") {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className = `toast ${type}`;
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 3000);
}

function clearInputs(ids) {
  ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
}

function hidePreview(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("hidden");
}

const months = ["Січня","Лютого","Березня","Квітня","Травня","Червня",
                "Липня","Серпня","Вересня","Жовтня","Листопада","Грудня"];

function loadAllData() { loadEvents(); loadPosters(); loadPhotos(); loadTeam(); }

// ══ ПОДІЇ ══
async function loadEvents() {
  const c = document.getElementById("eventsList");
  try {
    const snap = await getDocs(query(collection(db, "events"), orderBy("date", "desc")));
    c.innerHTML = "";
    if (snap.empty) {
      c.innerHTML = `<p style="color:var(--muted);padding:20px 0">Подій ще немає. Додай першу!</p>`;
      return;
    }
    snap.docs.forEach(d => {
      const e = d.data();
      const dt = new Date(e.date);
      const div = document.createElement("div");
      div.className = "list-item";
      div.innerHTML = `
        <div class="list-item-img">
          ${e.imageUrl ? `<img src="${e.imageUrl}" alt="" onerror="this.style.display='none'">` : "📅"}
        </div>
        <div class="list-item-info">
          <div class="list-item-badge">${e.category || "Подія"}</div>
          <h4>${e.title}</h4>
          <p>${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()} · ${dt.toLocaleTimeString("uk-UA",{hour:"2-digit",minute:"2-digit"})}${e.location ? " · " + e.location : ""}</p>
        </div>
        <div class="list-item-actions">
          <button class="btn-outline btn-sm btn-danger" onclick="deleteEvent('${d.id}')">Видалити</button>
        </div>`;
      c.appendChild(div);
    });
  } catch(e) { console.error(e); toast("Помилка завантаження подій", "error"); }
}

window.saveEvent = async function() {
  const title    = document.getElementById("ev-title").value.trim();
  const dateVal  = document.getElementById("ev-date").value;
  const category = document.getElementById("ev-category").value;
  const location = document.getElementById("ev-location").value.trim();
  const price    = document.getElementById("ev-price").value.trim();
  const desc     = document.getElementById("ev-desc").value.trim();
  const imageUrl = document.getElementById("ev-image-url").value.trim();

  if (!title)   { toast("Введіть назву події", "error"); return; }
  if (!dateVal) { toast("Оберіть дату", "error"); return; }

  try {
    await addDoc(collection(db, "events"), {
      title, date: new Date(dateVal).toISOString(),
      category, location, price,
      description: desc, imageUrl,
      createdAt: serverTimestamp()
    });
    toast("✅ Подію додано!");
    closeModal("eventModal");
    clearInputs(["ev-title","ev-date","ev-location","ev-price","ev-desc","ev-image-url"]);
    hidePreview("ev-preview");
    loadEvents();
  } catch(e) { console.error(e); toast("Помилка: " + e.message, "error"); }
};

window.deleteEvent = async function(id) {
  if (!confirm("Видалити цю подію?")) return;
  await deleteDoc(doc(db, "events", id));
  toast("Подію видалено");
  loadEvents();
};

// ══ АФІШІ ══
async function loadPosters() {
  const c = document.getElementById("postersList");
  try {
    const snap = await getDocs(query(collection(db, "posters"), orderBy("createdAt", "desc")));
    c.innerHTML = "";
    if (snap.empty) { c.innerHTML = `<p style="color:var(--muted);padding:20px 0">Афіш ще немає</p>`; return; }
    snap.docs.forEach(d => {
      const p = d.data();
      const div = document.createElement("div");
      div.className = "admin-img-card";
      div.innerHTML = `
        <img src="${p.imageUrl}" alt="${p.title}" loading="lazy" onerror="this.style.background='var(--bg3)'">
        <button class="delete-overlay" onclick="deletePoster('${d.id}')">Видалити</button>
        <div class="admin-img-card-info">
          <p><b>${p.title}</b></p>
          <p>${p.date || ""}</p>
        </div>`;
      c.appendChild(div);
    });
  } catch(e) { console.error(e); }
}

window.savePoster = async function() {
  const title    = document.getElementById("po-title").value.trim();
  const date     = document.getElementById("po-date").value.trim();
  const imageUrl = document.getElementById("po-url").value.trim();

  if (!title)    { toast("Введіть назву", "error"); return; }
  if (!imageUrl) { toast("Введіть посилання на зображення", "error"); return; }

  try {
    await addDoc(collection(db, "posters"), {
      title, date, imageUrl, createdAt: serverTimestamp()
    });
    toast("✅ Афішу додано!");
    closeModal("posterModal");
    clearInputs(["po-title","po-date","po-url"]);
    hidePreview("po-preview");
    loadPosters();
  } catch(e) { console.error(e); toast("Помилка: " + e.message, "error"); }
};

window.deletePoster = async function(id) {
  if (!confirm("Видалити афішу?")) return;
  await deleteDoc(doc(db, "posters", id));
  toast("Афішу видалено");
  loadPosters();
};

// ══ ФОТО ══
async function loadPhotos() {
  const c = document.getElementById("photosList");
  try {
    const snap = await getDocs(query(collection(db, "photos"), orderBy("createdAt", "desc")));
    c.innerHTML = "";
    if (snap.empty) { c.innerHTML = `<p style="color:var(--muted);padding:20px 0">Фото ще немає</p>`; return; }
    snap.docs.forEach(d => {
      const p = d.data();
      const div = document.createElement("div");
      div.className = "admin-img-card";
      div.innerHTML = `
        <img src="${p.imageUrl}" alt="${p.caption||""}" loading="lazy" onerror="this.style.background='var(--bg3)'">
        <button class="delete-overlay" onclick="deletePhoto('${d.id}')">Видалити</button>
        <div class="admin-img-card-info">
          <p>${p.caption || "Без підпису"}</p>
        </div>`;
      c.appendChild(div);
    });
  } catch(e) { console.error(e); }
}

window.savePhoto = async function() {
  const caption  = document.getElementById("ph-caption").value.trim();
  const imageUrl = document.getElementById("ph-url").value.trim();

  if (!imageUrl) { toast("Введіть посилання на фото", "error"); return; }

  try {
    await addDoc(collection(db, "photos"), {
      caption, imageUrl, createdAt: serverTimestamp()
    });
    toast("✅ Фото додано!");
    closeModal("photoModal");
    clearInputs(["ph-caption","ph-url"]);
    hidePreview("ph-preview");
    loadPhotos();
  } catch(e) { console.error(e); toast("Помилка: " + e.message, "error"); }
};

window.deletePhoto = async function(id) {
  if (!confirm("Видалити фото?")) return;
  await deleteDoc(doc(db, "photos", id));
  toast("Фото видалено");
  loadPhotos();
};

// ══ КОМАНДА ══
async function loadTeam() {
  const c = document.getElementById("teamList");
  try {
    const snap = await getDocs(query(collection(db, "team"), orderBy("order", "asc")));
    c.innerHTML = "";
    if (snap.empty) { c.innerHTML = `<p style="color:var(--muted);padding:20px 0">Команду ще не додано</p>`; return; }
    snap.docs.forEach(d => {
      const m = d.data();
      const div = document.createElement("div");
      div.className = "list-item";
      div.innerHTML = `
        <div class="list-item-img">
          ${m.photoUrl ? `<img src="${m.photoUrl}" alt="" onerror="this.innerHTML='🌸'">` : (m.emoji || "🌸")}
        </div>
        <div class="list-item-info">
          <h4>${m.name}</h4>
          <p>${m.role || ""}</p>
        </div>
        <div class="list-item-actions">
          <button class="btn-outline btn-sm btn-danger" onclick="deleteTeamMember('${d.id}')">Видалити</button>
        </div>`;
      c.appendChild(div);
    });
  } catch(e) { console.error(e); }
}

window.saveTeamMember = async function() {
  const name     = document.getElementById("tm-name").value.trim();
  const role     = document.getElementById("tm-role").value.trim();
  const emoji    = document.getElementById("tm-emoji").value.trim();
  const order    = Number(document.getElementById("tm-order").value) || 1;
  const photoUrl = document.getElementById("tm-url").value.trim();

  if (!name) { toast("Введіть ім'я", "error"); return; }

  try {
    await addDoc(collection(db, "team"), {
      name, role, emoji, photoUrl, order, createdAt: serverTimestamp()
    });
    toast("✅ Додано до команди!");
    closeModal("teamModal");
    clearInputs(["tm-name","tm-role","tm-emoji","tm-order","tm-url"]);
    hidePreview("tm-preview");
    loadTeam();
  } catch(e) { console.error(e); toast("Помилка: " + e.message, "error"); }
};

window.deleteTeamMember = async function(id) {
  if (!confirm("Видалити учасницю з команди?")) return;
  await deleteDoc(doc(db, "team", id));
  toast("Видалено");
  loadTeam();
};

// ══ ЖУРНАЛ ══
const CAT_LABELS = {
  moms:"Для мам", cooking:"Кулінарія", health:"Здоров'я",
  money:"Гроші", hobby:"Хобі", rights:"Права"
};

let allJournalArticles = [];

async function loadJournal() {
  const c = document.getElementById("journalList");
  if (!c) return;
  try {
    const snap = await getDocs(query(collection(db, "journal_articles"), orderBy("createdAt", "desc")));
    allJournalArticles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderJournal(allJournalArticles);
  } catch(e) { console.error(e); toast("Помилка завантаження журналу", "error"); }
}

function renderJournal(articles) {
  const c = document.getElementById("journalList");
  if (!c) return;
  c.innerHTML = "";
  if (!articles.length) {
    c.innerHTML = `<p style="color:var(--muted);padding:20px 0">Статей ще немає. Додай першу!</p>`;
    return;
  }
  articles.forEach(a => {
    const div = document.createElement("div");
    div.className = "list-item";
    div.innerHTML = `
      <div class="list-item-img">
        ${a.imageUrl ? `<img src="${a.imageUrl}" alt="" onerror="this.innerHTML='📖'">` : "📖"}
      </div>
      <div class="list-item-info">
        <div class="list-item-badge">${CAT_LABELS[a.category] || a.category}</div>
        <h4>${a.title}</h4>
        <p>${a.excerpt || a.content?.substring(0,80) || ""}</p>
      </div>
      <div class="list-item-actions">
        <button class="btn-outline btn-sm btn-danger" onclick="deleteJournalArticle('${a.id}')">Видалити</button>
      </div>`;
    c.appendChild(div);
  });
}

window.filterJournal = function(cat, btn) {
  document.querySelectorAll(".journal-filter .filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  if (cat === "all") { renderJournal(allJournalArticles); return; }
  renderJournal(allJournalArticles.filter(a => a.category === cat));
};

window.saveJournalArticle = async function() {
  const title       = document.getElementById("jn-title").value.trim();
  const category    = document.getElementById("jn-category").value;
  const subcategory = document.getElementById("jn-subcategory").value.trim();
  const excerpt     = document.getElementById("jn-excerpt").value.trim();
  const content     = document.getElementById("jn-content").value.trim();
  const imageUrl    = document.getElementById("jn-image").value.trim();

  if (!title)   { toast("Введіть заголовок", "error"); return; }
  if (!content) { toast("Введіть текст статті", "error"); return; }

  try {
    await addDoc(collection(db, "journal_articles"), {
      title, category, subcategory, excerpt, content, imageUrl,
      createdAt: serverTimestamp()
    });
    toast("✅ Статтю додано!");
    closeModal("journalModal");
    clearInputs(["jn-title","jn-subcategory","jn-excerpt","jn-content","jn-image"]);
    hidePreview("jn-preview");
    loadJournal();
  } catch(e) { console.error(e); toast("Помилка: " + e.message, "error"); }
};

window.deleteJournalArticle = async function(id) {
  if (!confirm("Видалити статтю?")) return;
  await deleteDoc(doc(db, "journal_articles", id));
  toast("Статтю видалено");
  loadJournal();
};

// Додаємо журнал в loadAllData
const _origLoadAll = loadAllData;
function loadAllData() {
  loadEvents(); loadPosters(); loadPhotos(); loadTeam(); loadJournal();
}

// Також при showTab journal
const _origShowTab = window.showTab;
window.showTab = function(name) {
  document.querySelectorAll(".admin-tab").forEach(t => t.classList.add("hidden"));
  document.querySelectorAll(".sidebar-btn").forEach(b => b.classList.remove("active"));
  document.getElementById(`tab-${name}`).classList.remove("hidden");
  document.getElementById(`nav-${name}`).classList.add("active");
  if (name === "journal") loadJournal();
};

// Додаємо стилі для filter-btn в адмінці
const style = document.createElement("style");
style.textContent = `.filter-btn { padding:8px 18px; border-radius:100px; border:1.5px solid var(--border); background:var(--bg2); color:var(--text2); font-family:var(--font-body); font-size:12px; font-weight:500; cursor:pointer; transition:all .2s; } .filter-btn:hover,.filter-btn.active { background:var(--accent); color:#fff; border-color:var(--accent); }`;
document.head.appendChild(style);
