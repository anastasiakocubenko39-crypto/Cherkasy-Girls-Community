@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

/* ═══════════════════════════════════
   TEAM GRID
═══════════════════════════════════ */
.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
}

/* ── Звичайна картка учасниці ── */
.team-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 36px 24px;
  text-align: center;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}
.team-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent3));
  opacity: 0; transition: opacity 0.3s;
}
.team-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow2);
}
.team-card:hover::before { opacity: 1; }

.team-avatar {
  width: 90px; height: 90px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent3));
  display: flex; align-items: center; justify-content: center;
  font-size: 36px; margin: 0 auto 18px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(212,56,106,.25);
}
.team-avatar img {
  width: 100%; height: 100%;
  object-fit: cover; border-radius: 50%;
}
.team-name {
  font-family: var(--font-head);
  font-size: 20px; font-weight: 700; margin-bottom: 6px;
}
.team-role {
  color: var(--muted); font-size: 13px; font-weight: 500;
}

/* ══════════════════════════════════
   КАРТКА ЗАСНОВНИЦІ — особливий стиль
══════════════════════════════════ */
.founder-card {
  /* Виділяємо на фоні інших */
  background: linear-gradient(135deg, var(--bg2) 0%, var(--bg3) 100%);
  border: 1.5px solid var(--border2, rgba(212,56,106,.28));
  border-radius: 28px;
  padding: 44px 32px 36px;
  box-shadow: var(--shadow2);
  /* Займає більше місця якщо вона одна */
  grid-column: span 1;
}
.founder-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 24px 60px rgba(212,56,106,.22);
}

/* Аватар без фото — великий градієнтний круг з ініціалом */
.founder-avatar {
  width: 110px; height: 110px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 50%, var(--accent3) 100%);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 20px;
  position: relative;
  box-shadow: 0 12px 36px rgba(212,56,106,.4);
  /* Якщо додасть фото пізніше — воно покриє ініціал */
  overflow: visible;
}
.founder-avatar img {
  width: 100%; height: 100%;
  object-fit: cover; border-radius: 50%;
  position: absolute; inset: 0;
  z-index: 2;
}
.founder-initials {
  font-family: var(--font-head);
  font-size: 52px; font-weight: 700;
  color: rgba(255,255,255,.95);
  line-height: 1;
  position: relative; z-index: 1;
}

/* Корона — маленький бейдж знизу аватара */
.founder-badge {
  position: absolute;
  bottom: -4px; right: -4px;
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--bg2);
  border: 2px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(0,0,0,.1);
  z-index: 3;
}

.founder-card .team-name {
  font-size: 24px; margin-bottom: 6px;
}
.founder-card .team-role {
  font-size: 14px; font-weight: 600;
  color: var(--accent); margin-bottom: 14px;
}

/* Короткий опис під роллю */
.founder-desc {
  color: var(--text2); font-size: 13px;
  line-height: 1.65; font-weight: 300;
  margin-bottom: 20px;
}

.founder-links {
  display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;
}
.founder-tg {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 20px; border-radius: 100px;
  background: #0088cc; color: white;
  font-size: 13px; font-weight: 600;
  text-decoration: none; transition: all .25s;
  box-shadow: 0 4px 14px rgba(0,136,204,.3);
}
.founder-tg:hover {
  background: #0099dd; transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(0,136,204,.45);
}
.founder-tg-group {
  background: var(--accent);
  box-shadow: 0 4px 14px rgba(212,56,106,.3);
}
.founder-tg-group:hover {
  background: var(--accent2);
  box-shadow: 0 8px 22px rgba(212,56,106,.4);
}

/* ═══════════════════════════════════
   STORY GRID
═══════════════════════════════════ */import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
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
.story-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px; align-items: center;
}
.story-text p {
  color: var(--text2); line-height: 1.85;
  font-size: 16px; font-weight: 300;
}

/* ═══════════════════════════════════
   RESPONSIVE
═══════════════════════════════════ */
@media (max-width: 768px) {
  .story-grid { grid-template-columns: 1fr; gap: 40px; }
  .about-visual { height: 200px; }
  .founder-card { padding: 32px 20px 28px; }
  .founder-avatar { width: 90px; height: 90px; }
  .founder-initials { font-size: 40px; }
}
