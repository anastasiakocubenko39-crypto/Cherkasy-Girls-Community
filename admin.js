/**
 * CGC Admin — Professional CMS
 * Firebase Structure:
 *   journal_articles/{id}          — metadata only (< 10KB)
 *   journal_articles/{id}/blocks/{blockId} — content blocks
 *   volunteer_collections/{id}     — volunteer data
 *   promo_posts/{id}               — promo data
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, deleteDoc, doc,
  getDocs, query, orderBy, serverTimestamp, writeBatch,
  getDoc, setDoc, limit
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getStorage, ref, uploadString, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyATAMeZCC69E0kaC0u9YBTMvzjI9qZudMc",
  authDomain: "girls-club-6160c.firebaseapp.com",
  projectId: "girls-club-6160c",
  storageBucket: "girls-club-6160c.firebasestorage.app",
  messagingSenderId: "492918751105",
  appId: "1:492918751105:web:3e8fc21d93ace0ef183280"
};

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const stor = getStorage(app);

// ── After login ──
window._adminReady = function() { loadAllData(); };
window.doLogout    = function() { sessionStorage.removeItem("cgc_admin"); location.reload(); };

// ════════════════════════════════════
// TABS
// ════════════════════════════════════
window.showTab = function(name) {
  document.querySelectorAll(".admin-tab").forEach(t => t.classList.add("hidden"));
  document.querySelectorAll(".sidebar-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("tab-"  + name)?.classList.remove("hidden");
  document.getElementById("nav-"  + name)?.classList.add("active");
  const titles = {
    events:"📅 Події", posters:"🎨 Афіші", photos:"📸 Фото",
    team:"👩‍💻 Команда", journal:"📖 Журнал",
    volunteer:"🇺🇦 Волонтерство", promo:"✨ Must Have"
  };
  const tb = document.getElementById("topbarTitle");
  if (tb) tb.textContent = titles[name] || name;
  if (window.innerWidth <= 900) {
    document.getElementById("sidebar")?.classList.remove("open");
    document.getElementById("sidebarOverlay").style.display = "none";
  }
  if (name === "journal")   loadJournal();
  if (name === "volunteer") loadVolunteer();
  if (name === "promo")     loadPromo();
};

// ════════════════════════════════════
// MODALS
// ════════════════════════════════════
window.openModal  = id => document.getElementById(id)?.classList.remove("hidden");
window.closeModal = id => document.getElementById(id)?.classList.add("hidden");
document.addEventListener("click", e => {
  if (e.target.classList.contains("modal")) window.closeModal(e.target.id);
});

// ════════════════════════════════════
// HELPERS
// ════════════════════════════════════
function safeStr(v) { return v == null ? "" : String(v); }

function toast(msg, type = "success") {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.className = "toast " + type;
  el.classList.remove("hidden");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => el.classList.add("hidden"), 3500);
}

function clearInputs(ids) {
  ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
}

function skeleton(n = 3) {
  return Array(n).fill(`<div class="skeleton" style="height:72px;margin-bottom:10px;border-radius:14px"></div>`).join("");
}

function emptyState(icon, title, sub) {
  return `<div class="empty-state">
    <span class="empty-state-icon">${icon}</span>
    <div class="empty-state-title">${title}</div>
    <p class="empty-state-sub">${sub}</p>
  </div>`;
}

const months = ["Січня","Лютого","Березня","Квітня","Травня","Червня",
                "Липня","Серпня","Вересня","Жовтня","Листопада","Грудня"];

// ════════════════════════════════════
// IMAGE UPLOAD → Firebase Storage
// Only URL stored in Firestore (no base64!)
// ════════════════════════════════════

/**
 * Upload image file to Firebase Storage
 * Returns download URL
 */
async function uploadImageToStorage(base64DataUrl, path) {
  // Strip data URL prefix
  const base64 = base64DataUrl.split(",")[1];
  const mimeType = base64DataUrl.split(";")[0].split(":")[1];
  const storageRef = ref(stor, path);
  await uploadString(storageRef, base64, "base64", { contentType: mimeType });
  return await getDownloadURL(storageRef);
}

/**
 * Compress image before upload (max 800px, quality 0.8)
 */
function compressImage(file, maxPx = 900, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width, h = img.height;
        if (w > maxPx || h > maxPx) {
          if (w > h) { h = Math.round(h * maxPx / w); w = maxPx; }
          else       { w = Math.round(w * maxPx / h); h = maxPx; }
        }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Handle file input → compress → preview
 * Does NOT upload yet — upload happens on save
 */
window.handleFileUpload = function(input, urlInputId, previewId, areaId) {
  const file = input.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) { toast("Оберіть зображення", "error"); return; }

  const area = document.getElementById(areaId);
  if (area) area.innerHTML = `<span class="upload-icon-big">⏳</span><div class="upload-zone-title">Обробка...</div>`;

  compressImage(file)
    .then(compressed => {
      const urlInput = document.getElementById(urlInputId);
      const preview  = document.getElementById(previewId);
      if (urlInput) urlInput.value = compressed;   // temporary base64 for preview
      if (urlInput) urlInput.dataset.compressed = "1"; // mark as compressed
      if (preview)  { preview.src = compressed; preview.classList.remove("hidden"); }
      const kb = Math.round(compressed.length * 0.75 / 1024);
      if (area) area.innerHTML = `<span class="upload-icon-big">✅</span><div class="upload-zone-title">${file.name}</div><div class="upload-zone-sub">${kb}KB → стиснуто</div>`;
    })
    .catch(() => toast("Помилка обробки фото", "error"));
};

window.previewUrl = function(inputId, previewId) {
  const url = document.getElementById(inputId)?.value.trim();
  const el  = document.getElementById(previewId);
  if (!el) return;
  if (url && !url.startsWith("data:")) { el.src = url; el.classList.remove("hidden"); el.onerror = () => el.classList.add("hidden"); }
  else if (!url) el.classList.add("hidden");
};

/**
 * Get final image URL:
 * - If value is a URL → return as-is
 * - If value is base64 → upload to Storage → return URL
 */
async function resolveImageUrl(base64OrUrl, storagePath) {
  if (!base64OrUrl) return "";
  if (!base64OrUrl.startsWith("data:")) return base64OrUrl; // already URL
  try {
    return await uploadImageToStorage(base64OrUrl, storagePath);
  } catch(e) {
    console.warn("Storage upload failed, using empty:", e.message);
    // Spark plan has no Storage — return empty rather than crash
    return "";
  }
}

// Drag & drop
window.handleDrop = function(event, urlInputId, previewId, areaId) {
  event.preventDefault();
  const file = event.dataTransfer?.files[0];
  if (!file) return;
  const fakeInput = { files:[file] };
  window.handleFileUpload(fakeInput, urlInputId, previewId, areaId);
};

// ════════════════════════════════════
// LOAD ALL
// ════════════════════════════════════
function loadAllData() {
  loadEvents(); loadPosters(); loadPhotos(); loadTeam(); loadJournal();
}

// ════════════════════════════════════
// ПОДІЇ
// ════════════════════════════════════
async function loadEvents() {
  const c = document.getElementById("eventsList");
  if (!c) return;
  c.innerHTML = skeleton();
  try {
    const snap = await getDocs(query(collection(db,"events"), orderBy("date","desc")));
    c.innerHTML = "";
    if (snap.empty) { c.innerHTML = emptyState("📅","Подій ще немає","Додай першу подію клубу"); return; }
    snap.docs.forEach(d => {
      const e  = d.data();
      const dt = new Date(e.date || Date.now());
      const el = document.createElement("div");
      el.className = "list-item";
      el.innerHTML = `
        <div class="list-item-thumb">
          ${e.imageUrl ? `<img src="${e.imageUrl}" alt="" onerror="this.style.display='none'">` : "<span style='font-size:24px'>📅</span>"}
        </div>
        <div class="list-item-info">
          <div class="list-item-badge">${safeStr(e.category)||"Подія"}</div>
          <div class="list-item-title">${safeStr(e.title)}</div>
          <div class="list-item-sub">${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}${e.location?" · "+e.location:""}</div>
        </div>
        <div class="list-item-actions">
          <button class="btn-danger btn-sm" onclick="deleteEvent('${d.id}')">🗑</button>
        </div>`;
      c.appendChild(el);
    });
  } catch(e) { c.innerHTML = emptyState("⚠️","Помилка завантаження",e.message); }
}

window.saveEvent = async function() {
  const title    = safeStr(document.getElementById("ev-title")?.value).trim();
  const dateVal  = safeStr(document.getElementById("ev-date")?.value);
  const category = safeStr(document.getElementById("ev-category")?.value);
  const location = safeStr(document.getElementById("ev-location")?.value).trim();
  const price    = safeStr(document.getElementById("ev-price")?.value).trim();
  const desc     = safeStr(document.getElementById("ev-desc")?.value).trim();
  const rawImg   = safeStr(document.getElementById("ev-image-url")?.value).trim();

  if (!title)   { toast("Введіть назву події","error"); return; }
  if (!dateVal) { toast("Оберіть дату","error"); return; }

  const btn = document.querySelector("#eventModal .btn-primary");
  btn.textContent = "⏳ Збереження..."; btn.disabled = true;

  try {
    const imageUrl = await resolveImageUrl(rawImg, `events/${Date.now()}`);
    await addDoc(collection(db,"events"), {
      title, date: new Date(dateVal).toISOString(),
      category, location, price, description: desc,
      imageUrl, createdAt: serverTimestamp()
    });
    toast("✅ Подію збережено!");
    window.closeModal("eventModal");
    clearInputs(["ev-title","ev-date","ev-location","ev-price","ev-desc","ev-image-url"]);
    document.getElementById("ev-preview")?.classList.add("hidden");
    loadEvents();
  } catch(e) { toast("Помилка: "+e.message,"error"); }
  finally { btn.textContent="✦ Зберегти подію"; btn.disabled=false; }
};

window.deleteEvent = async function(id) {
  if (!confirm("Видалити подію?")) return;
  await deleteDoc(doc(db,"events",id));
  toast("Видалено"); loadEvents();
};

// ════════════════════════════════════
// АФІШІ
// ════════════════════════════════════
async function loadPosters() {
  const c = document.getElementById("postersList");
  if (!c) return;
  c.innerHTML = skeleton();
  try {
    const snap = await getDocs(query(collection(db,"posters"), orderBy("createdAt","desc")));
    c.innerHTML = "";
    if (snap.empty) { c.innerHTML = emptyState("🎨","Афіш ще немає","Додай першу афішу"); return; }
    snap.docs.forEach(d => {
      const p   = d.data();
      const div = document.createElement("div");
      div.className = "admin-img-card";
      div.innerHTML = `
        <img src="${safeStr(p.imageUrl)}" alt="${safeStr(p.title)}" loading="lazy" onerror="this.style.background='var(--surface)'">
        <button class="delete-overlay" onclick="deletePoster('${d.id}')">🗑 Видалити</button>
        <div class="admin-img-card-info"><p><b>${safeStr(p.title)}</b></p><p>${safeStr(p.date)}</p></div>`;
      c.appendChild(div);
    });
  } catch(e) { c.innerHTML = emptyState("⚠️","Помилка",e.message); }
}

window.savePoster = async function() {
  const title  = safeStr(document.getElementById("po-title")?.value).trim();
  const date   = safeStr(document.getElementById("po-date")?.value).trim();
  const rawImg = safeStr(document.getElementById("po-url")?.value).trim();
  if (!title)  { toast("Введіть назву","error"); return; }
  if (!rawImg) { toast("Додайте фото або URL","error"); return; }

  const btn = document.querySelector("#posterModal .btn-primary");
  btn.textContent="⏳ ..."; btn.disabled=true;
  try {
    const imageUrl = await resolveImageUrl(rawImg, `posters/${Date.now()}`);
    await addDoc(collection(db,"posters"), { title, date, imageUrl, createdAt: serverTimestamp() });
    toast("✅ Афішу збережено!");
    window.closeModal("posterModal");
    clearInputs(["po-title","po-date","po-url"]);
    document.getElementById("po-preview")?.classList.add("hidden");
    loadPosters();
  } catch(e) { toast("Помилка: "+e.message,"error"); }
  finally { btn.textContent="✦ Зберегти"; btn.disabled=false; }
};

window.deletePoster = async function(id) {
  if (!confirm("Видалити?")) return;
  await deleteDoc(doc(db,"posters",id));
  toast("Видалено"); loadPosters();
};

// ════════════════════════════════════
// ФОТО
// ════════════════════════════════════
async function loadPhotos() {
  const c = document.getElementById("photosList");
  if (!c) return;
  c.innerHTML = skeleton();
  try {
    const snap = await getDocs(query(collection(db,"photos"), orderBy("createdAt","desc")));
    c.innerHTML = "";
    if (snap.empty) { c.innerHTML = emptyState("📸","Фото ще немає","Додай перші фото"); return; }
    snap.docs.forEach(d => {
      const p   = d.data();
      const div = document.createElement("div");
      div.className = "admin-img-card";
      div.innerHTML = `
        <img src="${safeStr(p.imageUrl)}" alt="" loading="lazy" onerror="this.style.background='var(--surface)'">
        <button class="delete-overlay" onclick="deletePhoto('${d.id}')">🗑 Видалити</button>
        <div class="admin-img-card-info"><p>${safeStr(p.caption)||"Без підпису"}</p></div>`;
      c.appendChild(div);
    });
  } catch(e) { c.innerHTML = emptyState("⚠️","Помилка",e.message); }
}

window.savePhoto = async function() {
  const caption = safeStr(document.getElementById("ph-caption")?.value).trim();
  const rawImg  = safeStr(document.getElementById("ph-url")?.value).trim();
  if (!rawImg) { toast("Додайте фото або URL","error"); return; }
  const btn = document.querySelector("#photoModal .btn-primary");
  btn.textContent="⏳ ..."; btn.disabled=true;
  try {
    const imageUrl = await resolveImageUrl(rawImg, `photos/${Date.now()}`);
    await addDoc(collection(db,"photos"), { caption, imageUrl, createdAt: serverTimestamp() });
    toast("✅ Фото збережено!");
    window.closeModal("photoModal");
    clearInputs(["ph-caption","ph-url"]);
    document.getElementById("ph-preview")?.classList.add("hidden");
    loadPhotos();
  } catch(e) { toast("Помилка: "+e.message,"error"); }
  finally { btn.textContent="✦ Зберегти"; btn.disabled=false; }
};

window.deletePhoto = async function(id) {
  if (!confirm("Видалити?")) return;
  await deleteDoc(doc(db,"photos",id));
  toast("Видалено"); loadPhotos();
};

// ════════════════════════════════════
// КОМАНДА
// ════════════════════════════════════
async function loadTeam() {
  const c = document.getElementById("teamList");
  if (!c) return;
  c.innerHTML = skeleton(2);
  try {
    const snap = await getDocs(query(collection(db,"team"), orderBy("order","asc")));
    c.innerHTML = "";
    if (snap.empty) { c.innerHTML = emptyState("👩‍💻","Команду не додано","Додай першу учасницю"); return; }
    snap.docs.forEach(d => {
      const m   = d.data();
      const div = document.createElement("div");
      div.className = "list-item";
      div.innerHTML = `
        <div class="list-item-thumb">
          ${m.photoUrl ? `<img src="${m.photoUrl}" alt="">` : `<span style="font-size:28px">${m.emoji||"🌸"}</span>`}
        </div>
        <div class="list-item-info">
          <div class="list-item-title">${safeStr(m.name)}</div>
          <div class="list-item-sub">${safeStr(m.role)}</div>
        </div>
        <div class="list-item-actions">
          <button class="btn-danger btn-sm" onclick="deleteTeamMember('${d.id}')">🗑</button>
        </div>`;
      c.appendChild(div);
    });
  } catch(e) { c.innerHTML = emptyState("⚠️","Помилка",e.message); }
}

window.saveTeamMember = async function() {
  const name   = safeStr(document.getElementById("tm-name")?.value).trim();
  const role   = safeStr(document.getElementById("tm-role")?.value).trim();
  const emoji  = safeStr(document.getElementById("tm-emoji")?.value).trim();
  const order  = Number(document.getElementById("tm-order")?.value) || 1;
  const rawImg = safeStr(document.getElementById("tm-url")?.value).trim();
  if (!name) { toast("Введіть ім'я","error"); return; }
  const btn = document.querySelector("#teamModal .btn-primary");
  btn.textContent="⏳ ..."; btn.disabled=true;
  try {
    const photoUrl = await resolveImageUrl(rawImg, `team/${Date.now()}`);
    await addDoc(collection(db,"team"), { name, role, emoji, photoUrl, order, createdAt: serverTimestamp() });
    toast("✅ Додано!");
    window.closeModal("teamModal");
    clearInputs(["tm-name","tm-role","tm-emoji","tm-order","tm-url"]);
    document.getElementById("tm-preview")?.classList.add("hidden");
    loadTeam();
  } catch(e) { toast("Помилка: "+e.message,"error"); }
  finally { btn.textContent="✦ Зберегти"; btn.disabled=false; }
};

window.deleteTeamMember = async function(id) {
  if (!confirm("Видалити?")) return;
  await deleteDoc(doc(db,"team",id));
  toast("Видалено"); loadTeam();
};

// ════════════════════════════════════
// ЖУРНАЛ — CMS STRUCTURE
// ════════════════════════════════════
/**
 * Article document (< 10KB):
 *   journal_articles/{id}
 *   Fields: title, category, subcategory, excerpt,
 *           coverImageUrl, instagram, telegram, tiktok,
 *           website, monoUrl, goalAmount, collected,
 *           publishedAt, createdAt, updatedAt, status
 *
 * Blocks subcollection:
 *   journal_articles/{id}/blocks/{blockId}
 *   Fields: type("text"|"image"), text, imageUrl, order, createdAt
 */

const CAT_LABELS = {
  moms:"Для мам", cooking:"Кулінарія", health:"Здоров'я",
  money:"Гроші", hobby:"Хобі", rights:"Права",
  holidays:"Свята", psychology:"Психологія", news:"Новини",
  forme:"Для мене", travel:"Відпустка",
  volunteer:"Волонтерство", promo:"Must Have"
};

window.allJournalArticles = [];

async function loadJournal() {
  const c = document.getElementById("journalList");
  if (!c) return;
  c.innerHTML = skeleton(4);
  try {
    // Load only metadata — no blocks, no content, no images in main doc
    const snap = await getDocs(
      query(collection(db,"journal_articles"), orderBy("createdAt","desc"))
    );
    window.allJournalArticles = snap.docs.map(d => ({ id:d.id, ...d.data() }));
    renderJournal(window.allJournalArticles);
  } catch(e) {
    // Fallback without orderBy
    try {
      const snap2 = await getDocs(collection(db,"journal_articles"));
      window.allJournalArticles = snap2.docs.map(d => ({ id:d.id, ...d.data() }));
      window.allJournalArticles.sort((a,b) => (b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
      renderJournal(window.allJournalArticles);
    } catch(e2) { c.innerHTML = emptyState("⚠️","Помилка завантаження",e2.message); }
  }
}

function renderJournal(articles) {
  const c = document.getElementById("journalList");
  if (!c) return;
  if (!articles.length) {
    c.innerHTML = emptyState("📝","Статей ще немає","Натисни «Нова стаття» щоб додати перший матеріал");
    return;
  }
  c.innerHTML = "";
  articles.forEach(a => {
    const div = document.createElement("div");
    div.className = "list-item";
    const date = a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("uk-UA") : "";
    div.innerHTML = `
      <div class="list-item-thumb">
        ${a.coverImageUrl ? `<img src="${a.coverImageUrl}" alt="" onerror="this.style.display='none'">` : "<span style='font-size:24px'>📖</span>"}
      </div>
      <div class="list-item-info">
        <div class="list-item-badge">${CAT_LABELS[a.category]||safeStr(a.category)}</div>
        <div class="list-item-title">${safeStr(a.title)}</div>
        <div class="list-item-sub">${date?date+" · ":""}${safeStr(a.excerpt).substring(0,80)}</div>
      </div>
      <div class="list-item-actions">
        <button class="btn-danger btn-sm" onclick="deleteJournalArticle('${a.id}')">🗑</button>
      </div>`;
    c.appendChild(div);
  });
}

window.filterJournal = function(cat, btn) {
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderJournal(cat==="all" ? window.allJournalArticles : window.allJournalArticles.filter(a=>a.category===cat));
};

window.searchJournal = function(q) {
  const term = q.toLowerCase();
  if (!term) { renderJournal(window.allJournalArticles); return; }
  renderJournal(window.allJournalArticles.filter(a =>
    (a.title||"").toLowerCase().includes(term) ||
    (a.excerpt||"").toLowerCase().includes(term)
  ));
};

/**
 * Save article — splits into:
 * 1. Article metadata doc (small, no base64)
 * 2. Cover image → Storage → URL
 * 3. Each block → subcollection doc
 *    Block images → Storage → URL
 */
window.saveJournalArticle = async function() {
  const title       = safeStr(document.getElementById("jn-title")?.value).trim();
  const category    = safeStr(document.getElementById("jn-category")?.value) || "moms";
  const subcategory = safeStr(document.getElementById("jn-subcategory")?.value);
  const excerpt     = safeStr(document.getElementById("jn-excerpt")?.value).trim();
  const mainText    = safeStr(document.getElementById("jn-content")?.value).trim();
  const pubDate     = safeStr(document.getElementById("jn-date")?.value);
  const instagram   = safeStr(document.getElementById("jn-instagram")?.value).trim();
  const telegram    = safeStr(document.getElementById("jn-telegram")?.value).trim();
  const tiktok      = safeStr(document.getElementById("jn-tiktok")?.value).trim();
  const website     = safeStr(document.getElementById("jn-website")?.value).trim();
  const monoUrl     = safeStr(document.getElementById("jn-mono")?.value).trim();
  const goalAmount  = Number(document.getElementById("jn-goal")?.value) || 0;
  const collected   = Number(document.getElementById("jn-collected")?.value) || 0;

  if (!title) { toast("Введіть заголовок","error"); return; }

  const btn = document.querySelector("#journalModal .btn-primary");
  btn.textContent = "⏳ Публікація..."; btn.disabled = true;

  try {
    // 1. Collect block data from DOM
    const blockDoms = document.querySelectorAll("#jn-blocks-wrap .journal-block-item");
    const blockData = [];
    blockDoms.forEach((item, i) => {
      const num  = item.id.replace("block-","");
      const img  = safeStr(document.getElementById("burl-"+num)?.value).trim();
      const text = safeStr(document.getElementById("btxt-"+num)?.value).trim();
      if (img || text) blockData.push({ img, text, order: i });
    });
    // Add main text as first block if provided
    if (mainText) blockData.unshift({ img:"", text: mainText, order:-1 });

    // 2. Upload cover image (first block image or dedicated field)
    let coverImageUrl = "";
    const firstBlockWithImg = blockData.find(b => b.img);
    if (firstBlockWithImg?.img) {
      coverImageUrl = await resolveImageUrl(
        firstBlockWithImg.img, `journal/covers/${Date.now()}`
      );
    }

    // 3. Create article metadata doc (small!)
    const articleRef = await addDoc(collection(db,"journal_articles"), {
      title, category, subcategory, excerpt,
      coverImageUrl,
      instagram, telegram, tiktok, website,
      monoUrl, goalAmount, collected,
      blockCount: blockData.length,
      publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      createdAt:   serverTimestamp(),
      updatedAt:   serverTimestamp(),
      status: "published"
    });

    // 4. Save each block as subcollection document
    const blocksCol = collection(db, "journal_articles", articleRef.id, "blocks");
    const batchOps  = [];

    for (let i = 0; i < blockData.length; i++) {
      const b = blockData[i];
      // Upload block image if base64
      let blockImageUrl = "";
      if (b.img) {
        blockImageUrl = await resolveImageUrl(
          b.img, `journal/${articleRef.id}/block_${i}_${Date.now()}`
        );
      }
      batchOps.push(addDoc(blocksCol, {
        type:     b.img ? (b.text ? "mixed" : "image") : "text",
        text:     b.text,
        imageUrl: blockImageUrl,
        order:    b.order >= 0 ? b.order : i,
        createdAt: serverTimestamp()
      }));
    }

    await Promise.all(batchOps);

    toast(`✅ Статтю опубліковано! (${blockData.length} блоків)`);
    window.closeModal("journalModal");

    // Reset form
    clearInputs(["jn-title","jn-date","jn-subcategory","jn-excerpt","jn-content",
                 "jn-instagram","jn-telegram","jn-tiktok","jn-website",
                 "jn-mono","jn-goal","jn-collected"]);
    const wrap = document.getElementById("jn-blocks-wrap");
    if (wrap) wrap.innerHTML = "";
    if (window.addJournalBlock) window.addJournalBlock();

    loadJournal();
  } catch(e) {
    console.error(e);
    toast("Помилка: " + e.message, "error");
  } finally {
    btn.textContent = "✦ Опублікувати";
    btn.disabled = false;
  }
};

window.deleteJournalArticle = async function(id) {
  if (!confirm("Видалити статтю та всі блоки?")) return;
  try {
    // Delete blocks subcollection first
    const blocksSnap = await getDocs(collection(db,"journal_articles",id,"blocks"));
    const batch = writeBatch(db);
    blocksSnap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    // Delete article
    await deleteDoc(doc(db,"journal_articles",id));
    toast("Статтю видалено");
    loadJournal();
  } catch(e) { toast("Помилка: "+e.message,"error"); }
};

// ════════════════════════════════════
// ВОЛОНТЕРСТВО
// ════════════════════════════════════
async function loadVolunteer() {
  const c = document.getElementById("volunteerList");
  if (!c) return;
  c.innerHTML = skeleton(2);
  try {
    const snap = await getDocs(collection(db,"volunteer_collections"));
    const items = snap.docs.map(d=>({id:d.id,...d.data()}));
    items.sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    c.innerHTML = "";
    if (!items.length) { c.innerHTML = emptyState("🇺🇦","Зборів ще немає","Додай перший збір"); return; }
    items.forEach(v => {
      const pct = v.goalAmount ? Math.min(100,Math.round((v.collected||0)/v.goalAmount*100)) : 0;
      const div = document.createElement("div");
      div.className = "list-item";
      div.innerHTML = `
        <div class="list-item-thumb">
          ${v.imageUrl?`<img src="${v.imageUrl}" alt="">`:"<span style='font-size:24px'>🇺🇦</span>"}
        </div>
        <div class="list-item-info">
          <div class="list-item-badge">${v.status==="active"?"✅ Активний":"🔒 Закритий"}</div>
          <div class="list-item-title">${safeStr(v.title)}</div>
          <div class="list-item-sub">${(v.collected||0).toLocaleString()} / ${(v.goalAmount||0).toLocaleString()} грн · ${pct}%</div>
          <div class="progress-wrap"><div class="progress-fill" style="width:${pct}%;background:linear-gradient(90deg,#1a56c4,#f5c400)"></div></div>
        </div>
        <div class="list-item-actions">
          <button class="btn-danger btn-sm" onclick="deleteVolunteer('${v.id}')">🗑</button>
        </div>`;
      c.appendChild(div);
    });
  } catch(e) { c.innerHTML = emptyState("⚠️","Помилка",e.message); }
}

window.saveVolunteer = async function() {
  const title      = safeStr(document.getElementById("vol-title")?.value).trim();
  const desc       = safeStr(document.getElementById("vol-desc")?.value).trim();
  const rawImg     = safeStr(document.getElementById("vol-imageUrl")?.value).trim();
  const monoUrl    = safeStr(document.getElementById("vol-mono")?.value).trim();
  const goalAmount = Number(document.getElementById("vol-goal")?.value)||0;
  const collected  = Number(document.getElementById("vol-collected")?.value)||0;
  const status     = safeStr(document.getElementById("vol-status")?.value)||"active";
  const category   = safeStr(document.getElementById("vol-category")?.value)||"military";
  if (!title) { toast("Введіть назву збору","error"); return; }
  const btn = document.querySelector("#volunteerModal .btn-primary");
  btn.textContent="⏳ ..."; btn.disabled=true;
  try {
    const imageUrl = await resolveImageUrl(rawImg, `volunteer/${Date.now()}`);
    await addDoc(collection(db,"volunteer_collections"),{
      title, desc, imageUrl, monoUrl, goalAmount, collected, status, category,
      createdAt: serverTimestamp()
    });
    toast("✅ Збір збережено!");
    window.closeModal("volunteerModal");
    clearInputs(["vol-title","vol-desc","vol-imageUrl","vol-mono","vol-goal","vol-collected"]);
    document.getElementById("vol-preview")?.classList.add("hidden");
    loadVolunteer();
  } catch(e) { toast("Помилка: "+e.message,"error"); }
  finally { btn.textContent="✦ Зберегти збір"; btn.disabled=false; }
};

window.deleteVolunteer = async function(id) {
  if (!confirm("Видалити збір?")) return;
  await deleteDoc(doc(db,"volunteer_collections",id));
  toast("Видалено"); loadVolunteer();
};

// ════════════════════════════════════
// PROMO
// ════════════════════════════════════
async function loadPromo() {
  const c = document.getElementById("promoList");
  if (!c) return;
  c.innerHTML = skeleton(2);
  try {
    const snap = await getDocs(collection(db,"promo_posts"));
    const items = snap.docs.map(d=>({id:d.id,...d.data()}));
    items.sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    c.innerHTML = "";
    if (!items.length) { c.innerHTML = emptyState("✨","Promo-постів ще немає","Додай першу рекомендацію"); return; }
    items.forEach(p => {
      const div = document.createElement("div");
      div.className = "list-item";
      div.innerHTML = `
        <div class="list-item-thumb">
          ${p.imageUrl?`<img src="${p.imageUrl}" alt="">`:"<span style='font-size:24px'>✨</span>"}
        </div>
        <div class="list-item-info">
          <div class="list-item-badge">${safeStr(p.category)}</div>
          <div class="list-item-title">${safeStr(p.title)}</div>
          <div class="list-item-sub">${safeStr(p.shortDesc).substring(0,80)}</div>
        </div>
        <div class="list-item-actions">
          <button class="btn-danger btn-sm" onclick="deletePromo('${p.id}')">🗑</button>
        </div>`;
      c.appendChild(div);
    });
  } catch(e) { c.innerHTML = emptyState("⚠️","Помилка",e.message); }
}

window.savePromo = async function() {
  const title     = safeStr(document.getElementById("pr-title")?.value).trim();
  const category  = safeStr(document.getElementById("pr-category")?.value);
  const shortDesc = safeStr(document.getElementById("pr-short")?.value).trim();
  const content   = safeStr(document.getElementById("pr-content")?.value).trim();
  const rawImg    = safeStr(document.getElementById("pr-imageUrl")?.value).trim();
  const instagram = safeStr(document.getElementById("pr-instagram")?.value).trim();
  const telegram  = safeStr(document.getElementById("pr-telegram")?.value).trim();
  const tiktok    = safeStr(document.getElementById("pr-tiktok")?.value).trim();
  const website   = safeStr(document.getElementById("pr-website")?.value).trim();
  if (!title) { toast("Введіть назву","error"); return; }
  const btn = document.querySelector("#promoModal .btn-primary");
  btn.textContent="⏳ ..."; btn.disabled=true;
  try {
    const imageUrl = await resolveImageUrl(rawImg, `promo/${Date.now()}`);
    await addDoc(collection(db,"promo_posts"),{
      title, category, shortDesc, content, imageUrl,
      instagram, telegram, tiktok, website,
      createdAt: serverTimestamp()
    });
    toast("✅ Promo-пост збережено!");
    window.closeModal("promoModal");
    clearInputs(["pr-title","pr-short","pr-content","pr-imageUrl","pr-instagram","pr-telegram","pr-tiktok","pr-website"]);
    document.getElementById("pr-preview")?.classList.add("hidden");
    loadPromo();
  } catch(e) { toast("Помилка: "+e.message,"error"); }
  finally { btn.textContent="✦ Опублікувати"; btn.disabled=false; }
};

window.deletePromo = async function(id) {
  if (!confirm("Видалити?")) return;
  await deleteDoc(doc(db,"promo_posts",id));
  toast("Видалено"); loadPromo();
};
