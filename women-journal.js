import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, query, getDocs, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

// Кеш статей
const articlesCache = {};

// Категорії
const CATEGORIES = ["moms","cooking","health","money","hobby","rights"];

// Назви підкатегорій
const SUBCAT_LABELS = {
  moms:    { "kids-places":"Куди піти з дитиною", clubs:"Гуртки", development:"Розвиток", lifehacks:"Лайфхаки", newmom:"Поради молодим мамам" },
  cooking: { quick:"Швидкі рецепти", baking:"Випічка", desserts:"Десерти", festive:"Святкові страви", budget:"Бюджетне меню", kids:"Страви для дітей" },
  health:  { womens:"Жіноче здоров'я", vitamins:"Вітаміни", sleep:"Сон", stress:"Стрес", fitness:"Тренування", beauty:"Догляд", psychology:"Психологія" },
  money:   { budget:"Бюджет", save:"Як економити", savings:"Заощадження", apps:"Додатки", business:"Власна справа", stories:"Історії успіху" },
  hobby:   { drawing:"Малювання", handmade:"Handmade", embroidery:"Вишивка", decor:"Декор", photo:"Фото", games:"Ігри", gifts:"Подарунки" },
  rights:  { womens:"Права жінок", children:"Права дитини", violence:"Насильство", divorce:"Розлучення", labor:"Трудові права" },
};

// ── ЗАВАНТАЖЕННЯ СТАТЕЙ ──
async function loadArticles(category) {
  if (articlesCache[category]) return articlesCache[category];
  try {
    // Без orderBy щоб уникнути потреби в індексі
    const q = query(
      collection(db, "journal_articles"),
      where("category", "==", category)
    );
    const snap = await getDocs(q);
    const articles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // Сортуємо на клієнті
    articles.sort((a, b) => {
      const ta = a.createdAt?.seconds || 0;
      const tb = b.createdAt?.seconds || 0;
      return tb - ta;
    });
    articlesCache[category] = articles;
    return articles;
  } catch(e) {
    console.error("loadArticles error:", e);
    return [];
  }
}

// ── РЕНДЕР СТАТЕЙ ──
function renderArticles(category, articles, subcat = "all") {
  const container = document.getElementById(`articles-${category}`);
  if (!container) return;

  const filtered = subcat === "all" ? articles : articles.filter(a => a.subcategory === subcat);

  if (!filtered.length) {
    container.innerHTML = `
      <div class="empty-articles">
        <div style="font-size:48px">📝</div>
        <p>Статей поки немає. Незабаром з'являться нові матеріали!</p>
      </div>`;
    return;
  }

  container.innerHTML = "";
  filtered.forEach(article => {
    const card = document.createElement("div");
    card.className = "article-card";
    card.onclick = () => openArticle(article);

    const subcatLabel = SUBCAT_LABELS[category]?.[article.subcategory] || article.subcategory || "";

    const imgHtml = article.imageUrl
      ? `<div class="article-card-img"><img src="${article.imageUrl}" alt="${article.title}" loading="lazy" onerror="this.closest('.article-card-img').style.display='none'"></div>`
      : "";
    card.innerHTML = `
      ${imgHtml}
      <div class="article-card-body">
        ${subcatLabel ? `<span class="article-card-tag">${subcatLabel}</span>` : ""}
        <h3>${article.title}</h3>
        <p>${article.excerpt || article.content?.substring(0,120) || ""}</p>
        <span class="article-read-btn">Читати →</span>
      </div>`;
    if (!article.imageUrl) card.classList.add("no-img");
    container.appendChild(card);
  });
}

// ── ВІДКРИТИ СТАТТЮ ──
function openArticle(article) {
  const modal = document.getElementById("articleModal");
  const img   = document.getElementById("modal-img");
  const body  = document.getElementById("modal-body");

  document.getElementById("modal-title").textContent = article.title;
  const ALL_LABELS = {
    "kids-places":"Куди піти з дитиною","clubs":"Гуртки та секції",
    "development":"Розвиток дитини","lifehacks":"Лайфхаки","newmom":"Поради молодим мамам",
    "quick":"Швидкі рецепти","baking":"Випічка","desserts":"Десерти",
    "festive":"Святкові страви","budget":"Бюджетне меню","kids":"Страви для дітей",
    "womens":"Жіноче здоровя","vitamins":"Вітаміни","sleep":"Сон",
    "stress":"Стрес","fitness":"Тренування","beauty":"Догляд","psychology":"Психологія",
    "save":"Як економити","savings":"Заощадження","apps":"Додатки",
    "business":"Власна справа","stories":"Історії успіху",
    "drawing":"Малювання","handmade":"Handmade","embroidery":"Вишивка",
    "decor":"Декор дому","photo":"Фотографія","games":"Настільні ігри","gifts":"Подарунки",
    "violence":"Домашнє насильство","children":"Права дитини",
    "divorce":"Розлучення","labor":"Трудові права",
    "moms":"Для мам","cooking":"Кулінарія","health":"Здоровя",
    "money":"Гроші","hobby":"Хобі","rights":"Права"
  };
  const tagLabel = ALL_LABELS[article.subcategory] || ALL_LABELS[article.category] || article.subcategory || article.category || "";
  document.getElementById("modal-tag").textContent = tagLabel;

  // Ховаємо головне фото (покажемо в блоках)
  img.classList.add("hidden");

  // Відображаємо контент
  const hasBlocks = article.blocks && article.blocks.some(b => b.img || b.text);

  if (hasBlocks) {
    // Новий формат — блоки фото+текст
    body.innerHTML = article.blocks.map(b => `
      ${b.img ? `<img src="${b.img}" alt="" style="width:100%;border-radius:14px;margin-bottom:14px;object-fit:cover;max-height:320px" onerror="this.style.display='none'">` : ""}
      ${b.text ? `<p style="margin-bottom:20px;white-space:pre-wrap;line-height:1.8;font-size:15px">${b.text}</p>` : ""}
    `).join("");
    // Також показуємо основний текст якщо є
    if (article.content) {
      body.innerHTML += `<p style="white-space:pre-wrap;line-height:1.8;font-size:15px;margin-top:16px">${article.content}</p>`;
    }
  } else if (article.content) {
    // Старий формат — просто текст
    body.innerHTML = `<p style="white-space:pre-wrap;line-height:1.8;font-size:15px">${article.content}</p>`;
    if (article.imageUrl) {
      img.src = article.imageUrl;
      img.classList.remove("hidden");
    }
  } else {
    body.innerHTML = `<p style="color:var(--muted);font-size:15px">Текст статті відсутній</p>`;
  }

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

window.closeModal = function(id) {
  document.getElementById(id).classList.add("hidden");
  document.body.style.overflow = "";
};

document.addEventListener("click", e => {
  if (e.target.classList.contains("modal")) {
    e.target.classList.add("hidden");
    document.body.style.overflow = "";
  }
});

// ── ФІЛЬТР ──
window.filterArticles = function(category, subcat, btn) {
  document.querySelectorAll(`#${category}-body .subcat-btn`).forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  const articles = articlesCache[category] || [];
  renderArticles(category, articles, subcat);
};

// ── АКОРДЕОН ──
window.toggleSection = function(bodyId) {
  const body  = document.getElementById(bodyId);
  const arrow = document.getElementById(`arrow-${bodyId}`);
  const catId = bodyId.replace("-body","");

  if (body.classList.contains("open")) {
    body.classList.remove("open");
    if (arrow) arrow.classList.remove("open");
  } else {
    body.classList.add("open");
    if (arrow) arrow.classList.add("open");
    // Ініціалізуємо калькулятор при відкритті кулінарії
    if (catId === "cooking" && typeof initCalcUI === "function") {
      setTimeout(() => initCalcUI("bju-calc-wrap"), 50);
    }
    // Завантажуємо при першому відкритті
    if (!articlesCache[catId]) {
      loadArticles(catId).then(articles => {
        articlesCache[catId] = articles;
        renderArticles(catId, articles);
      });
    }
  }
};

// ── СКРОЛ ДО СЕКЦІЇ ──
window.scrollToSection = function(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    // Відкрити секцію якщо закрита
    const body = document.getElementById(`${id}-body`);
    if (body && !body.classList.contains("open")) {
      toggleSection(`${id}-body`);
    }
  }
  // Оновити активну кнопку
  document.querySelectorAll(".cat-nav-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".cat-nav-btn").forEach(b => {
    if (b.getAttribute("onclick")?.includes(id)) b.classList.add("active");
  });
};

// ── ІНІЦІАЛІЗАЦІЯ — відкриваємо першу секцію ──
window.addEventListener("DOMContentLoaded", () => {
  // Відкрити першу секцію
  const firstBody = document.getElementById("moms-body");
  const firstArrow = document.getElementById("arrow-moms-body");
  if (firstBody) { firstBody.classList.add("open"); }
  if (firstArrow) { firstArrow.classList.add("open"); }

  // Завантажити статті першої секції
  loadArticles("moms").then(articles => renderArticles("moms", articles));
});

// Scroll spy для cat-nav
window.addEventListener("scroll", () => {
  const sections = ["moms","cooking","health","money","hobby","rights"];
  let current = "";
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top < 200) current = id;
  });
  if (current) {
    document.querySelectorAll(".cat-nav-btn").forEach(b => {
      b.classList.toggle("active", b.getAttribute("onclick")?.includes(current));
    });
  }
});
