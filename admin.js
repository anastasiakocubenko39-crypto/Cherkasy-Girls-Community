import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, deleteDoc, doc,
  getDocs, query, orderBy, serverTimestamp, updateDoc
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

// ── Після логіну ──
window._adminReady = function() { loadAllData(); };

window.doLogout = function() {
  sessionStorage.removeItem("cgc_admin");
  location.reload();
};

// ── TABS ──
window.showTab = function(name) {
  document.querySelectorAll(".admin-tab").forEach(t => t.classList.add("hidden"));
  document.querySelectorAll(".sidebar-btn").forEach(b => b.classList.remove("active"));
  const tab = document.getElementById("tab-" + name);
  const nav = document.getElementById("nav-" + name);
  if (tab) tab.classList.remove("hidden");
  if (nav) nav.classList.add("active");
  if (name === "journal")    loadJournal();
  if (name === "volunteer")  loadVolunteer();
  if (name === "promo")      loadPromo();
};

// ── MODALS ──
window.openModal  = function(id) { document.getElementById(id)?.classList.remove("hidden"); };
window.closeModal = function(id) { document.getElementById(id)?.classList.add("hidden"); };
document.addEventListener("click", e => {
  if (e.target.classList.contains("modal")) closeModal(e.target.id);
});

// ── FILE → BASE64 ──
window.handleFileUpload = function(input, urlInputId, previewId, areaId) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { toast("Файл завеликий! Максимум 2MB", "error"); return; }
  const area = document.getElementById(areaId);
  if (area) area.innerHTML = `<div class="upload-icon">⏳</div><p>Завантаження...</p>`;
  const reader = new FileReader();
  reader.onload = e => {
    const base64 = e.target.result;
    const urlInput = document.getElementById(urlInputId);
    const preview  = document.getElementById(previewId);
    if (urlInput) urlInput.value = base64;
    if (preview)  { preview.src = base64; preview.classList.remove("hidden"); }
    if (area) area.innerHTML = `<div class="upload-icon">✅</div><p>${file.name}</p>`;
  };
  reader.readAsDataURL(file);
};

window.previewUrl = function(inputId, previewId) {
  const url = document.getElementById(inputId)?.value.trim();
  const preview = document.getElementById(previewId);
  if (!preview) return;
  if (url) { preview.src = url; preview.classList.remove("hidden"); preview.onerror = () => preview.classList.add("hidden"); }
  else preview.classList.add("hidden");
};

// ── TOAST ──
function toast(msg, type = "success") {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.className = "toast " + type;
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 3500);
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

function safeStr(v) { return (v === undefined || v === null) ? "" : String(v); }

// ── LOAD ALL ──
function loadAllData() {
  loadEvents(); loadPosters(); loadPhotos(); loadTeam(); loadJournal();
  loadVolunteer(); loadPromo();
}

// ══════════════════════════════════════
// ПОДІЇ
// ══════════════════════════════════════
async function loadEvents() {
  const c = document.getElementById("eventsList");
  if (!c) return;
  c.innerHTML = `<p style="color:var(--muted)">Завантаження...</p>`;
  try {
    const snap = await getDocs(query(collection(db, "events"), orderBy("date", "desc")));
    c.innerHTML = "";
    if (snap.empty) { c.innerHTML = `<p style="color:var(--muted);padding:20px 0">Подій ще немає</p>`; return; }
    snap.docs.forEach(d => {
      const e = d.data();
      const dt = new Date(e.date || Date.now());
      const div = document.createElement("div");
      div.className = "list-item";
      div.innerHTML = `
        <div class="list-item-thumb">${e.imageUrl ? `<img src="${e.imageUrl}" alt="" onerror="this.style.display='none'">` : "📅"}</div>
        <div class="list-item-info">
          <div class="list-item-badge">${safeStr(e.category) || "Подія"}</div>
          <div class="list-item-title">${safeStr(e.title)}</div>
          <p>${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}${e.location ? " · " + e.location : ""}</p>
        </div>
        <div class="list-item-actions">
          <button class="btn-outline btn-sm btn-danger" onclick="deleteEvent('${d.id}')">Видалити</button>
        </div>`;
      c.appendChild(div);
    });
  } catch(e) { console.error(e); c.innerHTML = `<p style="color:red">Помилка: ${e.message}</p>`; }
}

window.saveEvent = async function() {
  const title    = safeStr(document.getElementById("ev-title")?.value);
  const dateVal  = safeStr(document.getElementById("ev-date")?.value);
  const category = safeStr(document.getElementById("ev-category")?.value);
  const location = safeStr(document.getElementById("ev-location")?.value);
  const price    = safeStr(document.getElementById("ev-price")?.value);
  const desc     = safeStr(document.getElementById("ev-desc")?.value);
  const imageUrl = safeStr(document.getElementById("ev-image-url")?.value);
  if (!title.trim())   { toast("Введіть назву події", "error"); return; }
  if (!dateVal) { toast("Оберіть дату", "error"); return; }
  try {
    await addDoc(collection(db, "events"), {
      title: title.trim(), date: new Date(dateVal).toISOString(),
      category, location: location.trim(), price: price.trim(),
      description: desc.trim(), imageUrl, createdAt: serverTimestamp()
    });
    toast("✅ Подію додано!");
    closeModal("eventModal");
    clearInputs(["ev-title","ev-date","ev-location","ev-price","ev-desc","ev-image-url"]);
    hidePreview("ev-preview");
    loadEvents();
  } catch(e) { console.error(e); toast("Помилка: " + e.message, "error"); }
};

window.deleteEvent = async function(id) {
  if (!confirm("Видалити подію?")) return;
  await deleteDoc(doc(db, "events", id));
  toast("Видалено"); loadEvents();
};

// ══════════════════════════════════════
// АФІШІ
// ══════════════════════════════════════
async function loadPosters() {
  const c = document.getElementById("postersList");
  if (!c) return;
  try {
    const snap = await getDocs(query(collection(db, "posters"), orderBy("createdAt", "desc")));
    c.innerHTML = "";
    if (snap.empty) { c.innerHTML = `<p style="color:var(--muted);padding:20px 0">Афіш ще немає</p>`; return; }
    snap.docs.forEach(d => {
      const p = d.data();
      const div = document.createElement("div");
      div.className = "admin-img-card";
      div.innerHTML = `
        <img src="${safeStr(p.imageUrl)}" alt="${safeStr(p.title)}" loading="lazy" onerror="this.style.background='var(--bg3)'">
        <button class="delete-overlay" onclick="deletePoster('${d.id}')">Видалити</button>
        <div class="admin-img-card-info"><p><b>${safeStr(p.title)}</b></p><p>${safeStr(p.date)}</p></div>`;
      c.appendChild(div);
    });
  } catch(e) { console.error(e); }
}

window.savePoster = async function() {
  const title    = safeStr(document.getElementById("po-title")?.value).trim();
  const date     = safeStr(document.getElementById("po-date")?.value).trim();
  const imageUrl = safeStr(document.getElementById("po-url")?.value).trim();
  if (!title)    { toast("Введіть назву", "error"); return; }
  if (!imageUrl) { toast("Додайте фото або URL", "error"); return; }
  try {
    await addDoc(collection(db, "posters"), { title, date, imageUrl, createdAt: serverTimestamp() });
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
  toast("Видалено"); loadPosters();
};

// ══════════════════════════════════════
// ФОТО
// ══════════════════════════════════════
async function loadPhotos() {
  const c = document.getElementById("photosList");
  if (!c) return;
  try {
    const snap = await getDocs(query(collection(db, "photos"), orderBy("createdAt", "desc")));
    c.innerHTML = "";
    if (snap.empty) { c.innerHTML = `<p style="color:var(--muted);padding:20px 0">Фото ще немає</p>`; return; }
    snap.docs.forEach(d => {
      const p = d.data();
      const div = document.createElement("div");
      div.className = "admin-img-card";
      div.innerHTML = `
        <img src="${safeStr(p.imageUrl)}" alt="" loading="lazy" onerror="this.style.background='var(--bg3)'">
        <button class="delete-overlay" onclick="deletePhoto('${d.id}')">Видалити</button>
        <div class="admin-img-card-info"><p>${safeStr(p.caption) || "Без підпису"}</p></div>`;
      c.appendChild(div);
    });
  } catch(e) { console.error(e); }
}

window.savePhoto = async function() {
  const caption  = safeStr(document.getElementById("ph-caption")?.value).trim();
  const imageUrl = safeStr(document.getElementById("ph-url")?.value).trim();
  if (!imageUrl) { toast("Додайте фото або URL", "error"); return; }
  try {
    await addDoc(collection(db, "photos"), { caption, imageUrl, createdAt: serverTimestamp() });
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
  toast("Видалено"); loadPhotos();
};

// ══════════════════════════════════════
// КОМАНДА
// ══════════════════════════════════════
async function loadTeam() {
  const c = document.getElementById("teamList");
  if (!c) return;
  try {
    const snap = await getDocs(query(collection(db, "team"), orderBy("order", "asc")));
    c.innerHTML = "";
    if (snap.empty) { c.innerHTML = `<p style="color:var(--muted);padding:20px 0">Команду не додано</p>`; return; }
    snap.docs.forEach(d => {
      const m = d.data();
      const div = document.createElement("div");
      div.className = "list-item";
      div.innerHTML = `
        <div class="list-item-thumb">${m.photoUrl ? `<img src="${m.photoUrl}" alt="">` : (m.emoji || "🌸")}</div>
        <div class="list-item-info"><div class="list-item-title">${safeStr(m.name)}</div><p>${safeStr(m.role)}</p></div>
        <div class="list-item-actions">
          <button class="btn-outline btn-sm btn-danger" onclick="deleteTeamMember('${d.id}')">Видалити</button>
        </div>`;
      c.appendChild(div);
    });
  } catch(e) { console.error(e); }
}

window.saveTeamMember = async function() {
  const name     = safeStr(document.getElementById("tm-name")?.value).trim();
  const role     = safeStr(document.getElementById("tm-role")?.value).trim();
  const emoji    = safeStr(document.getElementById("tm-emoji")?.value).trim();
  const order    = Number(document.getElementById("tm-order")?.value) || 1;
  const photoUrl = safeStr(document.getElementById("tm-url")?.value).trim();
  if (!name) { toast("Введіть ім'я", "error"); return; }
  try {
    await addDoc(collection(db, "team"), { name, role, emoji, photoUrl, order, createdAt: serverTimestamp() });
    toast("✅ Додано!");
    closeModal("teamModal");
    clearInputs(["tm-name","tm-role","tm-emoji","tm-order","tm-url"]);
    hidePreview("tm-preview");
    loadTeam();
  } catch(e) { console.error(e); toast("Помилка: " + e.message, "error"); }
};

window.deleteTeamMember = async function(id) {
  if (!confirm("Видалити?")) return;
  await deleteDoc(doc(db, "team", id));
  toast("Видалено"); loadTeam();
};

// ══════════════════════════════════════
// ЖУРНАЛ
// ══════════════════════════════════════
const CAT_LABELS = {
  moms:"Для мам", cooking:"Кулінарія", health:"Здоров'я",
  money:"Гроші", hobby:"Хобі", rights:"Права",
  holidays:"Свята", psychology:"Психологія", news:"Новини",
  forme:"Для мене", travel:"Відпустка", volunteer:"Волонтерство", promo:"Must Have"
};

let allJournalArticles = [];

async function loadJournal() {
  const c = document.getElementById("journalList");
  if (!c) return;
  c.innerHTML = `<p style="color:var(--muted)">Завантаження...</p>`;
  try {
    const snap = await getDocs(query(collection(db, "journal_articles"), orderBy("createdAt", "desc")));
    allJournalArticles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderJournal(allJournalArticles);
  } catch(e) {
    // Try without orderBy if index missing
    try {
      const snap2 = await getDocs(collection(db, "journal_articles"));
      allJournalArticles = snap2.docs.map(d => ({ id: d.id, ...d.data() }));
      allJournalArticles.sort((a,b) => (b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
      renderJournal(allJournalArticles);
    } catch(e2) { console.error(e2); c.innerHTML = `<p style="color:red">Помилка: ${e2.message}</p>`; }
  }
}

function renderJournal(articles) {
  const c = document.getElementById("journalList");
  if (!c) return;
  c.innerHTML = "";
  if (!articles.length) { c.innerHTML = `<p style="color:var(--muted);padding:20px 0">Статей ще немає</p>`; return; }
  articles.forEach(a => {
    const div = document.createElement("div");
    div.className = "list-item";
    div.innerHTML = `
      <div class="list-item-thumb">${a.imageUrl ? `<img src="${a.imageUrl}" alt="">` : "📖"}</div>
      <div class="list-item-info">
        <div class="list-item-badge">${CAT_LABELS[a.category] || safeStr(a.category)}</div>
        <div class="list-item-title">${safeStr(a.title)}</div>
        <p>${(safeStr(a.excerpt) || safeStr(a.content)).substring(0,80)}</p>
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
  renderJournal(cat === "all" ? allJournalArticles : allJournalArticles.filter(a => a.category === cat));
};

window.saveJournalArticle = async function() {
  const title       = safeStr(document.getElementById("jn-title")?.value).trim();
  const category    = safeStr(document.getElementById("jn-category")?.value) || "moms";
  const subcategory = safeStr(document.getElementById("jn-subcategory")?.value);
  const excerpt     = safeStr(document.getElementById("jn-excerpt")?.value).trim();
  const mainContent = safeStr(document.getElementById("jn-content")?.value).trim();
  const pubDate     = safeStr(document.getElementById("jn-date")?.value);
  // Extra fields for promo/volunteer
  const instagram   = safeStr(document.getElementById("jn-instagram")?.value).trim();
  const telegram    = safeStr(document.getElementById("jn-telegram")?.value).trim();
  const tiktok      = safeStr(document.getElementById("jn-tiktok")?.value).trim();
  const website     = safeStr(document.getElementById("jn-website")?.value).trim();
  const monoUrl     = safeStr(document.getElementById("jn-mono")?.value).trim();
  const goalAmount  = safeStr(document.getElementById("jn-goal")?.value).trim();
  const collected   = safeStr(document.getElementById("jn-collected")?.value).trim();

  if (!title) { toast("Введіть заголовок", "error"); return; }

  // Collect blocks from DOM
  const blocks = [];
  const bWrap = document.getElementById("jn-blocks-wrap");
  if (bWrap) {
    bWrap.querySelectorAll(".journal-block-item").forEach((item, i) => {
      const num  = item.id.replace("block-","");
      const img  = safeStr(document.getElementById("burl-"+num)?.value).trim();
      const text = safeStr(document.getElementById("btxt-"+num)?.value).trim();
      blocks.push({ img, text, order: i });
    });
  }

  const firstWithImg = blocks.find(b => b.img);
  const imageUrl = firstWithImg ? firstWithImg.img : "";

  const data = {
    title, category, subcategory, excerpt,
    content:   mainContent, blocks, imageUrl,
    instagram, telegram, tiktok, website, monoUrl,
    goalAmount, collected,
    publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
    createdAt:   serverTimestamp()
  };

  // Remove empty strings for cleanliness but keep required fields
  Object.keys(data).forEach(k => {
    if (data[k] === undefined) data[k] = "";
  });

  try {
    await addDoc(collection(db, "journal_articles"), data);
    toast("✅ Статтю додано!");
    closeModal("journalModal");
    clearInputs(["jn-title","jn-subcategory","jn-excerpt","jn-content","jn-date",
                 "jn-instagram","jn-telegram","jn-tiktok","jn-website","jn-mono","jn-goal","jn-collected"]);
    if (bWrap) { bWrap.innerHTML = ""; }
    if (window.addJournalBlock) window.addJournalBlock();
    loadJournal();
  } catch(e) { console.error(e); toast("Помилка: " + e.message, "error"); }
};

window.deleteJournalArticle = async function(id) {
  if (!confirm("Видалити статтю?")) return;
  await deleteDoc(doc(db, "journal_articles", id));
  toast("Видалено"); loadJournal();
};

// ══════════════════════════════════════
// ВОЛОНТЕРСТВО (окремий розділ зборів)
// ══════════════════════════════════════
async function loadVolunteer() {
  const c = document.getElementById("volunteerList");
  if (!c) return;
  c.innerHTML = `<p style="color:var(--muted)">Завантаження...</p>`;
  try {
    const snap = await getDocs(collection(db, "volunteer_collections"));
    const items = snap.docs.map(d => ({id:d.id,...d.data()}));
    items.sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    c.innerHTML = "";
    if (!items.length) { c.innerHTML = `<p style="color:var(--muted);padding:20px 0">Зборів ще немає</p>`; return; }
    items.forEach(v => {
      const pct = v.goalAmount ? Math.min(100, Math.round((v.collected||0) / v.goalAmount * 100)) : 0;
      const div = document.createElement("div");
      div.className = "list-item";
      div.innerHTML = `
        <div class="list-item-thumb">${v.imageUrl ? `<img src="${v.imageUrl}" alt="">` : "💛"}</div>
        <div class="list-item-info">
          <div class="list-item-badge">${v.status === "active" ? "✅ Активний" : "🔒 Закритий"}</div>
          <div class="list-item-title">${safeStr(v.title)}</div>
          <p>Зібрано: ${safeStr(v.collected)||0} / ${safeStr(v.goalAmount)||0} грн · ${pct}%</p>
          <div style="background:#e5e7eb;border-radius:100px;height:6px;margin-top:6px">
            <div style="background:#1a56c4;height:6px;border-radius:100px;width:${pct}%"></div>
          </div>
        </div>
        <div class="list-item-actions">
          <button class="btn-outline btn-sm btn-danger" onclick="deleteVolunteer('${v.id}')">Видалити</button>
        </div>`;
      c.appendChild(div);
    });
  } catch(e) { console.error(e); c.innerHTML = `<p style="color:red">Помилка: ${e.message}</p>`; }
}

window.saveVolunteer = async function() {
  const title      = safeStr(document.getElementById("vol-title")?.value).trim();
  const desc       = safeStr(document.getElementById("vol-desc")?.value).trim();
  const imageUrl   = safeStr(document.getElementById("vol-imageUrl")?.value).trim();
  const monoUrl    = safeStr(document.getElementById("vol-mono")?.value).trim();
  const goalAmount = Number(document.getElementById("vol-goal")?.value) || 0;
  const collected  = Number(document.getElementById("vol-collected")?.value) || 0;
  const status     = safeStr(document.getElementById("vol-status")?.value) || "active";
  const category   = safeStr(document.getElementById("vol-category")?.value) || "military";

  if (!title) { toast("Введіть назву збору", "error"); return; }
  try {
    await addDoc(collection(db, "volunteer_collections"), {
      title, desc, imageUrl, monoUrl, goalAmount, collected, status, category,
      createdAt: serverTimestamp()
    });
    toast("✅ Збір додано!");
    closeModal("volunteerModal");
    clearInputs(["vol-title","vol-desc","vol-imageUrl","vol-mono","vol-goal","vol-collected"]);
    hidePreview("vol-preview");
    loadVolunteer();
  } catch(e) { console.error(e); toast("Помилка: " + e.message, "error"); }
};

window.deleteVolunteer = async function(id) {
  if (!confirm("Видалити збір?")) return;
  await deleteDoc(doc(db, "volunteer_collections", id));
  toast("Видалено"); loadVolunteer();
};

// ══════════════════════════════════════
// PROMO
// ══════════════════════════════════════
async function loadPromo() {
  const c = document.getElementById("promoList");
  if (!c) return;
  c.innerHTML = `<p style="color:var(--muted)">Завантаження...</p>`;
  try {
    const snap = await getDocs(collection(db, "promo_posts"));
    const items = snap.docs.map(d => ({id:d.id,...d.data()}));
    items.sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    c.innerHTML = "";
    if (!items.length) { c.innerHTML = `<p style="color:var(--muted);padding:20px 0">Promo-постів ще немає</p>`; return; }
    items.forEach(p => {
      const div = document.createElement("div");
      div.className = "list-item";
      div.innerHTML = `
        <div class="list-item-thumb">${p.imageUrl ? `<img src="${p.imageUrl}" alt="">` : "✨"}</div>
        <div class="list-item-info">
          <div class="list-item-badge">${safeStr(p.category)}</div>
          <div class="list-item-title">${safeStr(p.title)}</div>
          <p>${safeStr(p.shortDesc).substring(0,80)}</p>
        </div>
        <div class="list-item-actions">
          <button class="btn-outline btn-sm btn-danger" onclick="deletePromo('${p.id}')">Видалити</button>
        </div>`;
      c.appendChild(div);
    });
  } catch(e) { console.error(e); c.innerHTML = `<p style="color:red">Помилка: ${e.message}</p>`; }
}

window.savePromo = async function() {
  const title     = safeStr(document.getElementById("pr-title")?.value).trim();
  const category  = safeStr(document.getElementById("pr-category")?.value);
  const shortDesc = safeStr(document.getElementById("pr-short")?.value).trim();
  const content   = safeStr(document.getElementById("pr-content")?.value).trim();
  const imageUrl  = safeStr(document.getElementById("pr-imageUrl")?.value).trim();
  const instagram = safeStr(document.getElementById("pr-instagram")?.value).trim();
  const telegram  = safeStr(document.getElementById("pr-telegram")?.value).trim();
  const tiktok    = safeStr(document.getElementById("pr-tiktok")?.value).trim();
  const website   = safeStr(document.getElementById("pr-website")?.value).trim();

  if (!title) { toast("Введіть назву", "error"); return; }
  try {
    await addDoc(collection(db, "promo_posts"), {
      title, category, shortDesc, content, imageUrl,
      instagram, telegram, tiktok, website,
      createdAt: serverTimestamp()
    });
    toast("✅ Promo-пост додано!");
    closeModal("promoModal");
    clearInputs(["pr-title","pr-short","pr-content","pr-imageUrl","pr-instagram","pr-telegram","pr-tiktok","pr-website"]);
    hidePreview("pr-preview");
    loadPromo();
  } catch(e) { console.error(e); toast("Помилка: " + e.message, "error"); }
};

window.deletePromo = async function(id) {
  if (!confirm("Видалити?")) return;
  await deleteDoc(doc(db, "promo_posts", id));
  toast("Видалено"); loadPromo();
};
