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
const db  = getFirestore(app);

document.getElementById("year").textContent = new Date().getFullYear();

// ── КОМАНДА ──
async function loadTeam() {
  const container = document.getElementById("teamGrid");
  if (!container) return;

  try {
    const q    = query(collection(db, "team"), orderBy("order", "asc"));
    const snap = await getDocs(q);

    // Якщо в Firebase є учасниці — показуємо їх
    // Але завжди першою показуємо Анастасію якщо її немає в базі
    const members = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Перевіряємо чи є Анастасія в базі
    const hasAnastasia = members.some(m =>
      m.name && m.name.toLowerCase().includes("анастасі")
    );

    container.innerHTML = "";

    // Якщо Анастасії немає в базі — додаємо її вручну першою
    if (!hasAnastasia) {
      container.insertAdjacentHTML("beforeend", buildFounderCard());
    }

    // Додаємо учасниць з Firebase (крім порожніх placeholders)
    members.forEach(m => {
      // Пропускаємо якщо це очевидний placeholder
      if (!m.name || m.name.toLowerCase().includes("додай")) return;
      container.insertAdjacentHTML("beforeend", buildMemberCard(m));
    });

    // Якщо після Firebase нікого немає — показуємо тільки Анастасію
    if (container.children.length === 0) {
      container.innerHTML = buildFounderCard();
    }

  } catch (e) {
    // При помилці Firebase — показуємо хоча б Анастасію
    console.error(e);
    if (container) container.innerHTML = buildFounderCard();
  }
}

// Картка засновниці — красивий статичний варіант
function buildFounderCard() {
  return `
    <div class="team-card founder-card">
      <div class="team-avatar founder-avatar">
        <span class="founder-initials">А</span>
        <div class="founder-badge">👑</div>
      </div>
      <div class="team-name">Анастасія</div>
      <div class="team-role">Засновниця</div>
      <div class="founder-desc">Створила Cherkasy Girls Club щоб кожна дівчина знайшла своє місце 🌸</div>
      <div class="founder-links">
        <a href="https://t.me/anastasiyahhhhh" target="_blank" class="founder-tg">💬 Telegram</a>
        <a href="https://t.me/+QrrTYPiCMMQ2Mjky" target="_blank" class="founder-tg founder-tg-group">🌸 Спільнота</a>
      </div>
    </div>`;
}

// Звичайна картка учасниці
function buildMemberCard(m) {
  const avatar = m.photoUrl
    ? `<img src="${m.photoUrl}" alt="${m.name}">`
    : `<span style="font-size:36px">${m.emoji || "🌸"}</span>`;

  return `
    <div class="team-card">
      <div class="team-avatar">${avatar}</div>
      <div class="team-name">${m.name}</div>
      <div class="team-role">${m.role || ""}</div>
    </div>`;
}

loadTeam();
