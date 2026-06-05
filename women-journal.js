/**
 * Women Journal — Frontend
 * Reads CMS structure:
 *   journal_articles/{id}           — metadata
 *   journal_articles/{id}/blocks/*  — content blocks (lazy loaded)
 *   promo_posts/{id}                — Must Have (окрема колекція!)
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, query, getDocs, where, orderBy
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

// Cache
const articlesCache = {};
const blocksCache   = {};

const SUBCAT_LABELS = {
  moms:    {"kids-places":"Куди піти","clubs":"Гуртки","development":"Розвиток","lifehacks":"Лайфхаки","newmom":"Молодим мамам"},
  cooking: {"quick":"Швидкі рецепти","baking":"Випічка","desserts":"Десерти","festive":"Святкові","budget":"Бюджетне меню","kids":"Для дітей"},
  health:  {"womens":"Жіноче здоров'я","vitamins":"Вітаміни","sleep":"Сон","stress":"Стрес","fitness":"Тренування","beauty":"Догляд","psychology":"Психологія"},
  money:   {"budget":"Бюджет","save":"Як економити","savings":"Заощадження","apps":"Додатки","business":"Власна справа","stories":"Успіх"},
  hobby:   {"drawing":"Малювання","handmade":"Handmade","embroidery":"Вишивка","decor":"Декор","photo":"Фото","games":"Ігри","gifts":"Подарунки"},
  rights:  {"womens":"Права жінок","children":"Права дитини","violence":"Насильство","divorce":"Розлучення","labor":"Трудові права","discrimination":"Дискримінація","legal":"Правова допомога","bullying":"Переслідування"},
  holidays:{"birthday":"День народження","wedding":"Весілля","march8":"8 Березня","motherday":"День матері","mykola":"Миколая","newyear":"Новий рік","christmas":"Різдво"},
  psychology:{"books":"Книги","relations":"Стосунки","child":"Психологія дитини","personal":"Особиста","selfesteem":"Самооцінка","burnout":"Тривожність"},
  news:    {"general":"Загальні","women":"Жіночі","psychology":"Психологія","health":"Здоров'я","moms":"Для мам","culture":"Культура"},
  forme:   {"books":"Книги","series":"Серіали","movies":"Кіно","concerts":"Концерти","rest":"Відпочинок","places":"Місця","inspiration":"Натхнення"},
  travel:  {"road":"Дорога","hotels":"Готелі","restaurants":"Ресторани","cities":"Міста","countries":"Країни","beach":"Пляжі","lifehacks":"Лайфхаки","budget":"Бюджет"},
  volunteer:{"collections":"Збори","military":"Допомога військовим","medical":"Медична","cars":"Авто","drones":"Дрони","clothes":"Одяг","food":"Гуманітарна","animals":"Тварини","news":"Звіти"},
  promo:   {"beauty":"Beauty","fashion":"Fashion","cafes":"Заклади","gifts":"Подарунки","handmade":"Handmade","courses":"Курси","psychology":"Психологія","sweets":"Смаколики","rest":"Відпочинок","shops":"Магазини"},
};

const ALL_CATS = [
  "moms","cooking","health","money","hobby","rights",
  "holidays","psychology","news","forme","travel","volunteer","promo"
];

// ════════════════════════════════════
// ЗАВАНТАЖЕННЯ СТАТЕЙ
// ════════════════════════════════════

async function loadArticles(category) {
  if (articlesCache[category]) return articlesCache[category];

  // ✅ Must Have — читаємо з promo_posts (окрема колекція в адмінці!)
  if (category === "promo") {
    return await loadPromoArticles();
  }

  try {
    const q    = query(collection(db,"journal_articles"), where("category","==",category));
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id:d.id, ...d.data() }));
    list.sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
    articlesCache[category] = list;
    return list;
  } catch(e) { console.error("loadArticles:", e); return []; }
}

// ✅ Окрема функція для Must Have з promo_posts
async function loadPromoArticles() {
  if (articlesCache["promo"]) return articlesCache["promo"];
  try {
    const snap = await getDocs(collection(db, "promo_posts"));
    const list = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      // Маппінг полів promo_posts → формат article
      category:    "promo",
      subcategory: d.data().category || "",   // в promo_posts поле "category" = підкатегорія
      excerpt:     d.data().shortDesc || "",
      content:     d.data().content   || "",
      coverImageUrl: d.data().imageUrl || "",
    }));
    list.sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
    articlesCache["promo"] = list;
    return list;
  } catch(e) { console.error("loadPromoArticles:", e); return []; }
}

// ════════════════════════════════════
// БЛОКИ (lazy load)
// ════════════════════════════════════

async function loadBlocks(articleId) {
  if (blocksCache[articleId]) return blocksCache[articleId];
  try {
    const snap   = await getDocs(
      query(collection(db,"journal_articles",articleId,"blocks"), orderBy("order","asc"))
    );
    const blocks = snap.docs.map(d => d.data());
    blocksCache[articleId] = blocks;
    return blocks;
  } catch(e) {
    try {
      const snap2  = await getDocs(collection(db,"journal_articles",articleId,"blocks"));
      const blocks = snap2.docs.map(d => d.data()).sort((a,b) => (a.order||0)-(b.order||0));
      blocksCache[articleId] = blocks;
      return blocks;
    } catch(e2) { return []; }
  }
}

// ════════════════════════════════════
// РЕНДЕР КАРТОК
// ════════════════════════════════════

function renderArticles(category, articles, subcat = "all") {
  const container = document.getElementById("articles-" + category);
  if (!container) return;

  const filtered = subcat === "all"
    ? articles
    : articles.filter(a => a.subcategory === subcat);

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
    const card       = document.createElement("div");
    card.className   = "article-card";
    card.onclick     = () => openArticle(article);
    const subcatLabel = SUBCAT_LABELS[category]?.[article.subcategory] || article.subcategory || "";
    const cover = article.coverImageUrl || article.imageUrl || "";
    const imgHtml = cover
      ? `<div class="article-card-img"><img src="${cover}" alt="" loading="lazy" onerror="this.closest('.article-card-img').style.display='none'"></div>`
      : "";
    card.innerHTML = `
      ${imgHtml}
      <div class="article-card-body">
        ${subcatLabel ? `<span class="article-card-tag">${subcatLabel}</span>` : ""}
        <h3>${article.title||""}</h3>
        <p>${article.excerpt || ""}</p>
        <span class="article-read-btn">Читати →</span>
      </div>`;
    if (!cover) card.classList.add("no-img");
    container.appendChild(card);
  });
}

// ════════════════════════════════════
// ВІДКРИТИ СТАТТЮ (модал)
// ════════════════════════════════════

async function openArticle(article) {
  const modal = document.getElementById("articleModal");
  const img   = document.getElementById("modal-img");
  const body  = document.getElementById("modal-body");
  const links = document.getElementById("modal-links");

  document.getElementById("modal-title").textContent = article.title || "";

  let tagLabel = "";
  for (const [, subs] of Object.entries(SUBCAT_LABELS)) {
    if (subs[article.subcategory]) { tagLabel = subs[article.subcategory]; break; }
  }
  document.getElementById("modal-tag").textContent = tagLabel;

  const cover = article.coverImageUrl || article.imageUrl || "";
  if (cover) { img.src = cover; img.classList.remove("hidden"); }
  else img.classList.add("hidden");

  body.innerHTML = `<div style="text-align:center;padding:32px;color:var(--muted)">⏳ Завантаження...</div>`;
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  // ✅ Promo пости не мають блоків — показуємо content напряму
  if (article.category === "promo") {
    if (article.content) {
      body.innerHTML = `<p style="white-space:pre-wrap;line-height:1.85;font-size:15px">${article.content}</p>`;
    } else if (article.excerpt) {
      body.innerHTML = `<p style="white-space:pre-wrap;line-height:1.85;font-size:15px">${article.excerpt}</p>`;
    } else {
      body.innerHTML = `<p style="color:var(--muted);font-size:15px;text-align:center;padding:24px 0">Опис відсутній</p>`;
    }
  } else {
    // Журнальні статті — завантажуємо блоки
    const blocks = await loadBlocks(article.id);
    if (blocks.length) {
      body.innerHTML = blocks.map(b => {
        const imgPart  = b.imageUrl ? `<img src="${b.imageUrl}" alt="" style="width:100%;border-radius:14px;margin-bottom:14px;object-fit:cover;max-height:360px" loading="lazy" onerror="this.style.display='none'">` : "";
        const textPart = b.text ? `<p style="margin-bottom:20px;white-space:pre-wrap;line-height:1.85;font-size:15px">${b.text}</p>` : "";
        return imgPart + textPart;
      }).join('<hr style="border:none;border-top:1px solid var(--border);margin:20px 0">');
    } else if (article.content) {
      body.innerHTML = `<p style="white-space:pre-wrap;line-height:1.85;font-size:15px">${article.content}</p>`;
    } else {
      body.innerHTML = `<p style="color:var(--muted);font-size:15px;text-align:center;padding:24px 0">Текст статті відсутній</p>`;
    }
  }

  // Соціальні посилання
  if (links) {
    const soc = [];
    if (article.instagram) soc.push(`<a href="${article.instagram}" target="_blank" class="social-link">📸 Instagram</a>`);
    if (article.telegram)  soc.push(`<a href="${article.telegram}"  target="_blank" class="social-link">✈️ Telegram</a>`);
    if (article.tiktok)    soc.push(`<a href="${article.tiktok}"    target="_blank" class="social-link">🎵 TikTok</a>`);
    if (article.website)   soc.push(`<a href="${article.website}"   target="_blank" class="social-link btn-accent">Перейти →</a>`);
    if (article.monoUrl)   soc.push(`<a href="${article.monoUrl}"   target="_blank" class="social-link btn-donate">💛 Підтримати</a>`);
    links.innerHTML = soc.length ? `<div class="modal-social-row">${soc.join("")}</div>` : "";
  }
}

// ════════════════════════════════════
// ЗАКРИТИ МОДАЛ
// ════════════════════════════════════

window.closeModal = function(id) {
  document.getElementById(id)?.classList.add("hidden");
  document.body.style.overflow = "";
};

document.addEventListener("click", e => {
  if (e.target.classList.contains("modal")) {
    e.target.classList.add("hidden");
    document.body.style.overflow = "";
  }
});

// ════════════════════════════════════
// ФІЛЬТР
// ════════════════════════════════════

window._filterArticles = window.filterArticles = function(category, subcat, btn) {
  document.querySelectorAll("#"+category+"-body .subcat-btn").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  renderArticles(category, articlesCache[category]||[], subcat);
};

// ════════════════════════════════════
// АКОРДЕОН
// ════════════════════════════════════

window._toggleSection = window.toggleSection = function(bodyId) {
  const body  = document.getElementById(bodyId);
  const arrow = document.getElementById("arrow-"+bodyId);
  const catId = bodyId.replace("-body","");
  if (body.classList.contains("open")) {
    body.classList.remove("open");
    if (arrow) arrow.classList.remove("open");
  } else {
    body.classList.add("open");
    if (arrow) arrow.classList.add("open");
    if (catId==="cooking" && typeof initCalcUI==="function") setTimeout(()=>initCalcUI("bju-calc-wrap"),50);
    if (!articlesCache[catId]) {
      loadArticles(catId).then(list => { articlesCache[catId]=list; renderArticles(catId,list); });
    }
  }
};

// ════════════════════════════════════
// СКРОЛ ДО СЕКЦІЇ
// ════════════════════════════════════

window._scrollToSection = window.scrollToSection = function(id) {
  document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"});
  const bodyEl = document.getElementById(id+"-body");
  if (bodyEl && !bodyEl.classList.contains("open")) window._toggleSection(id+"-body");
  document.querySelectorAll(".cat-nav-btn").forEach(b => {
    b.classList.toggle("active", (b.getAttribute("onclick")||"").includes("'"+id+"'"));
  });
};

// ════════════════════════════════════
// ІНІЦІАЛІЗАЦІЯ
// ════════════════════════════════════

window.addEventListener("DOMContentLoaded", () => {
  const fb = document.getElementById("moms-body");
  const fa = document.getElementById("arrow-moms-body");
  if (fb) fb.classList.add("open");
  if (fa) fa.classList.add("open");
  loadArticles("moms").then(list => renderArticles("moms",list));
});

// ════════════════════════════════════
// SCROLL SPY
// ════════════════════════════════════

window.addEventListener("scroll", () => {
  let cur = "";
  ALL_CATS.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top < 220) cur = id;
  });
  if (cur) {
    document.querySelectorAll(".cat-nav-btn").forEach(b => {
      b.classList.toggle("active", (b.getAttribute("onclick")||"").includes("'"+cur+"'"));
    });
  }
});
