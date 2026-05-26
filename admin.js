import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, deleteDoc, doc,
  getDocs, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyATAMeZCC69E0kaC0u9YBTMvzjI9qZudMc",
  authDomain: "girls-club-6160c.firebaseapp.com",
  projectId: "girls-club-6160c",
  storageBucket: "girls-club-6160c.firebasestorage.app",
  messagingSenderId: "492918751105",
  appId: "1:492918751105:web:3e8fc21d93ace0ef183280"
};

const app     = initializeApp(firebaseConfig);
const db      = getFirestore(app);
const storage = getStorage(app);

const ADMIN_PASSWORD = "123456789";

// ── ПЕРЕВІРКА СЕСІЇ ──
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
  const passInput = document.getElementById("passInput");
  if (passInput) passInput.addEventListener("keydown", e => { if (e.key === "Enter") window.doLogin(); });
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
window.closeModal = function(id) { document.getElementById(id).classList.add("hidden"); };
document.addEventListener("click", e => { if (e.target.classList.contains("modal")) closeModal(e.target.id); });

// ── IMAGE PREVIEW ──
window.previewImage = function(input, previewId) {
  const preview = document.getElementById(previewId);
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = e => { preview.src = e.target.result; preview.classList.remove("hidden"); };
    reader.readAsDataURL(input.files[0]);
  }
};

window.updateUploadArea = function(input, areaId) {
  if (input.files && input.files[0]) {
    document.getElementById(areaId).querySelector("p").textContent = input.files[0].name;
  }
};

// ── UPLOAD ──
async function uploadFile(file, folder) {
  const path = `${folder}/${Date.now()}.${file.name.split(".").pop()}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return { url: await getDownloadURL(storageRef), path };
}

// ── TOAST ──
function toast(msg, type = "success") {
  const el = document.getElementById("toast");
  el.textContent = msg; el.className = `toast ${type}`;
  el.classList.remove("hidden");
  setTimeout(() => el.classList.add("hidden"), 3000);
}

function clearForm(ids) { ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; }); }

const months = ["Січня","Лютого","Березня","Квітня","Травня","Червня","Липня","Серпня","Вересня","Жовтня","Листопада","Грудня"];

function loadAllData() { loadEvents(); loadPosters(); loadPhotos(); loadTeam(); }

// ══ ПОДІЇ ══
async function loadEvents() {
  const c = document.getElementById("eventsList");
  try {
    const snap = await getDocs(query(collection(db, "events"), orderBy("date", "desc")));
    c.innerHTML = "";
    if (snap.empty) { c.innerHTML = `<p style="color:var(--muted);padding:20px">Подій ще немає. Додай першу!</p>`; return; }
    snap.docs.forEach(d => {
      const e = d.data(); const dt = new Date(e.date);
      const div = document.createElement("div"); div.className = "list-item";
      div.innerHTML = `
        <div class="list-item-img">${e.imageUrl ? `<img src="${e.imageUrl}" alt="">` : "📅"}</div>
        <div class="list-item-info">
          <div class="list-item-badge">${e.category || "Подія"}</div>
          <h4>${e.title}</h4>
          <p>${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()} · ${dt.toLocaleTimeString("uk-UA",{hour:"2-digit",minute:"2-digit"})}${e.location ? " · " + e.location : ""}</p>
        </div>
        <div class="list-item-actions">
          <button class="btn-outline btn-sm btn-danger" onclick="deleteEvent('${d.id}')">🗑 Видалити</button>
        </div>`;
      c.appendChild(div);
    });
  } catch(e) { console.error(e); }
}

window.saveEvent = async function() {
  const title    = document.getElementById("ev-title").value.trim();
  const dateVal  = document.getElementById("ev-date").value;
  const category = document.getElementById("ev-category").value;
  const location = document.getElementById("ev-location").value.trim();
  const price    = document.getElementById("ev-price").value.trim();
  const desc     = document.getElementById("ev-desc").value.trim();
  const urlImg   = document.getElementById("ev-image-url").value.trim();
  const fileImg  = document.getElementById("ev-image-file").files[0];
  if (!title) { toast("Введіть назву події", "error"); return; }
  if (!dateVal) { toast("Оберіть дату", "error"); return; }
  let imageUrl = urlImg; let storagePath = "";
  if (fileImg) { try { const r = await uploadFile(fileImg, "events"); imageUrl = r.url; storagePath = r.path; } catch(e) { toast("Помилка завантаження фото", "error"); return; } }
  try {
    await addDoc(collection(db, "events"), { title, date: new Date(dateVal).toISOString(), category, location, price, description: desc, imageUrl: imageUrl || "", storagePath, createdAt: serverTimestamp() });
    toast("✅ Подію додано!"); closeModal("eventModal");
    clearForm(["ev-title","ev-date","ev-location","ev-price","ev-desc","ev-image-url"]);
    document.getElementById("ev-image-file").value = "";
    document.getElementById("ev-preview").classList.add("hidden");
    loadEvents();
  } catch(e) { toast("Помилка: " + e.message, "error"); }
};

window.deleteEvent = async function(id) {
  if (!confirm("Видалити подію?")) return;
  await deleteDoc(doc(db, "events", id)); toast("Подію видалено"); loadEvents();
};

// ══ АФІШІ ══
async function loadPosters() {
  const c = document.getElementById("postersList");
  try {
    const snap = await getDocs(query(collection(db, "posters"), orderBy("createdAt", "desc")));
    c.innerHTML = "";
    if (snap.empty) { c.innerHTML = `<p style="color:var(--muted);padding:20px">Афіш ще немає</p>`; return; }
    snap.docs.forEach(d => {
      const p = d.data(); const div = document.createElement("div"); div.className = "admin-img-card";
      div.innerHTML = `<img src="${p.imageUrl}" alt="${p.title}" loading="lazy"><button class="delete-overlay" onclick="deletePoster('${d.id}','${p.storagePath||""}')">🗑 Видалити</button><div class="admin-img-card-info"><p><b>${p.title}</b></p><p>${p.date||""}</p></div>`;
      c.appendChild(div);
    });
  } catch(e) { console.error(e); }
}

window.savePoster = async function() {
  const title = document.getElementById("po-title").value.trim();
  const date  = document.getElementById("po-date").value.trim();
  const file  = document.getElementById("po-file").files[0];
  if (!title) { toast("Введіть назву", "error"); return; }
  if (!file)  { toast("Завантажте зображення", "error"); return; }
  try {
    const { url, path } = await uploadFile(file, "posters");
    await addDoc(collection(db, "posters"), { title, date, imageUrl: url, storagePath: path, createdAt: serverTimestamp() });
    toast("✅ Афішу додано!"); closeModal("posterModal");
    clearForm(["po-title","po-date"]); document.getElementById("po-file").value = "";
    document.getElementById("po-preview").classList.add("hidden"); loadPosters();
  } catch(e) { toast("Помилка: " + e.message, "error"); }
};

window.deletePoster = async function(id, path) {
  if (!confirm("Видалити афішу?")) return;
  await deleteDoc(doc(db, "posters", id));
  if (path) try { await deleteObject(ref(storage, path)); } catch(e) {}
  toast("Афішу видалено"); loadPosters();
};

// ══ ФОТО ══
async function loadPhotos() {
  const c = document.getElementById("photosList");
  try {
    const snap = await getDocs(query(collection(db, "photos"), orderBy("createdAt", "desc")));
    c.innerHTML = "";
    if (snap.empty) { c.innerHTML = `<p style="color:var(--muted);padding:20px">Фото ще немає</p>`; return; }
    snap.docs.forEach(d => {
      const p = d.data(); const div = document.createElement("div"); div.className = "admin-img-card";
      div.innerHTML = `<img src="${p.imageUrl}" alt="${p.caption||""}" loading="lazy"><button class="delete-overlay" onclick="deletePhoto('${d.id}','${p.storagePath||""}')">🗑 Видалити</button><div class="admin-img-card-info"><p>${p.caption||"Без підпису"}</p></div>`;
      c.appendChild(div);
    });
  } catch(e) { console.error(e); }
}

window.savePhoto = async function() {
  const caption = document.getElementById("ph-caption").value.trim();
  const file    = document.getElementById("ph-file").files[0];
  if (!file) { toast("Завантажте фото", "error"); return; }
  try {
    const { url, path } = await uploadFile(file, "photos");
    await addDoc(collection(db, "photos"), { caption, imageUrl: url, storagePath: path, createdAt: serverTimestamp() });
    toast("✅ Фото додано!"); closeModal("photoModal");
    document.getElementById("ph-caption").value = ""; document.getElementById("ph-file").value = "";
    document.getElementById("ph-preview").classList.add("hidden"); loadPhotos();
  } catch(e) { toast("Помилка: " + e.message, "error"); }
};

window.deletePhoto = async function(id, path) {
  if (!confirm("Видалити фото?")) return;
  await deleteDoc(doc(db, "photos", id));
  if (path) try { await deleteObject(ref(storage, path)); } catch(e) {}
  toast("Фото видалено"); loadPhotos();
};

// ══ КОМАНДА ══
async function loadTeam() {
  const c = document.getElementById("teamList");
  try {
    const snap = await getDocs(query(collection(db, "team"), orderBy("order", "asc")));
    c.innerHTML = "";
    if (snap.empty) { c.innerHTML = `<p style="color:var(--muted);padding:20px">Команду ще не додано</p>`; return; }
    snap.docs.forEach(d => {
      const m = d.data(); const div = document.createElement("div"); div.className = "list-item";
      div.innerHTML = `
        <div class="list-item-img">${m.photoUrl ? `<img src="${m.photoUrl}" alt="">` : (m.emoji || "🌸")}</div>
        <div class="list-item-info"><h4>${m.name}</h4><p>${m.role||""}</p></div>
        <div class="list-item-actions"><button class="btn-outline btn-sm btn-danger" onclick="deleteTeamMember('${d.id}','${m.storagePath||""}')">🗑</button></div>`;
      c.appendChild(div);
    });
  } catch(e) { console.error(e); }
}

window.saveTeamMember = async function() {
  const name  = document.getElementById("tm-name").value.trim();
  const role  = document.getElementById("tm-role").value.trim();
  const emoji = document.getElementById("tm-emoji").value.trim();
  const order = Number(document.getElementById("tm-order").value) || 1;
  const file  = document.getElementById("tm-file").files[0];
  if (!name) { toast("Введіть ім'я", "error"); return; }
  let photoUrl = ""; let storagePath = "";
  if (file) { try { const r = await uploadFile(file, "team"); photoUrl = r.url; storagePath = r.path; } catch(e) { toast("Помилка фото", "error"); return; } }
  try {
    await addDoc(collection(db, "team"), { name, role, emoji, photoUrl, storagePath, order, createdAt: serverTimestamp() });
    toast("✅ Додано!"); closeModal("teamModal");
    clearForm(["tm-name","tm-role","tm-emoji","tm-order"]); document.getElementById("tm-file").value = "";
    document.getElementById("tm-preview").classList.add("hidden"); loadTeam();
  } catch(e) { toast("Помилка: " + e.message, "error"); }
};

window.deleteTeamMember = async function(id, path) {
  if (!confirm("Видалити?")) return;
  await deleteDoc(doc(db, "team", id));
  if (path) try { await deleteObject(ref(storage, path)); } catch(e) {}
  toast("Видалено"); loadTeam();
};
