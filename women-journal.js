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

const articlesCache = {};

const ALL_CATEGORIES = [
  "moms","cooking","health","money","hobby","rights",
  "holidays","psychology","news","forme","travel","volunteer","promo"
];

const SUBCAT_LABELS = {
  moms:       {"kids-places":"Куди піти","clubs":"Гуртки","development":"Розвиток","lifehacks":"Лайфхаки","newmom":"Молодим мамам"},
  cooking:    {"quick":"Швидкі рецепти","baking":"Випічка","desserts":"Десерти","festive":"Святкові","budget":"Бюджетне меню","kids":"Для дітей"},
  health:     {"womens":"Жіноче здоров'я","vitamins":"Вітаміни","sleep":"Сон","stress":"Стрес","fitness":"Тренування","beauty":"Догляд","psychology":"Психологія"},
  money:      {"budget":"Бюджет","save":"Як економити","savings":"Заощадження","apps":"Додатки","business":"Власна справа","stories":"Успіх"},
  hobby:      {"drawing":"Малювання","handmade":"Handmade","embroidery":"Вишивка","decor":"Декор","photo":"Фото","games":"Ігри","gifts":"Подарунки"},
  rights:     {"womens":"Права жінок","children":"Права дитини","violence":"Насильство","divorce":"Розлучення","labor":"Трудові права","discrimination":"Від дискримінації","legal":"Безкоштовна допомога","bullying":"Переслідування"},
  holidays:   {"birthday":"День народження","wedding":"Весілля","march8":"8 Березня","motherday":"День матері","mykola":"Миколая","newyear":"Новий рік","christmas":"Різдво"},
  psychology: {"books":"Книги","relations":"Стосунки","child":"Психологія дитини","personal":"Особиста","selfesteem":"Самооцінка","burnout":"Тривожність"},
  news:       {"general":"Загальні","women":"Жіночі","psychology":"Психологія","health":"Здоров'я","moms":"Для мам","culture":"Культура"},
  forme:      {"books":"Книги","series":"Серіали","movies":"Кіно","concerts":"Концерти","rest":"Відпочинок","places":"Місця","inspiration":"Натхнення"},
  travel:     {"road":"Дорога","hotels":"Готелі","restaurants":"Ресторани","cities":"Міста","countries":"Країни","beach":"Пляжі","lifehacks":"Лайфхаки","budget":"Бюджет"},
  volunteer:  {"collections":"Збори","military":"Допомога військовим","medical":"Медична","cars":"Авто","drones":"Дрони","clothes":"Одяг","food":"Гуманітарна","animals":"Тварини","news":"Звіти"},
  promo:      {"beauty":"Beauty","fashion":"Fashion","cafes":"Заклади","gifts":"Подарунки","handmade":"Handmade","courses":"Курси","psychology":"Психологія","sweets":"Смаколики","rest":"Відпочинок","shops":"Магазини"},
};

async function loadArticles(category) {
  if (articlesCache[category]) return articlesCache[category];
  try {
    const q = query(collection(db, "journal_articles"), where("category", "==", category));
    const snap = await getDocs(q);
    const articles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    articles.sort((a, b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
    articlesCache[category] = articles;
    return articles;
  } catch(e) {
    console.error("loadArticles error:", e);
    return [];
  }
}

function renderArticles(category, articles, subcat = "all") {
  const container = document.getElementById("articles-" + category);
  if (!container) return;

  const filtered = subcat === "all" ? articles : articles.filter(a => a.subcategory === subcat);

  if (!filtered.length) {
    container.innerHTML = `<div class="empty-articles"><div style="font-size:48px">📝</div><p>Статей поки немає. Незабаром з'являться нові матеріали!</p></div>`;
    return;
  }

  container.innerHTML = "";
  filtered.forEach(article => {
    const card = document.createElement("div");
    card.className = "article-card";
    card.onclick = () => openArticle(article);

    const subcatLabel = SUBCAT_LABELS[category]?.[article.subcategory] || article.subcategory || "";
    const imgHtml = article.imageUrl
      ? `<div class="article-card-img"><img src="${article.imageUrl}" alt="" loading="lazy" onerror="this.closest('.article-card-img').style.display='none'"></div>`
      : "";

    card.innerHTML = `
      ${imgHtml}
      <div class="article-card-body">
        ${subcatLabel ? `<span class="article-card-tag">${subcatLabel}</span>` : ""}
        <h3>${article.title}</h3>
        <p>${article.excerpt || (article.content||"").substring(0,120)}</p>
        <span class="article-read-btn">Читати →</span>
      </div>`;
    if (!article.imageUrl) card.classList.add("no-img");
    container.appendChild(card);
  });
}

function openArticle(article) {
  const modal = document.getElementById("articleModal");
  const img   = document.getElementById("modal-img");
  const body  = document.getElementById("modal-body");
  const links = document.getElementById("modal-links");

  document.getElementById("modal-title").textContent = article.title;

  // Find label
  let tagLabel = article.subcategory || article.category || "";
  for (const [cat, subs] of Object.entries(SUBCAT_LABELS)) {
    if (subs[article.subcategory]) { tagLabel = subs[article.subcategory]; break; }
  }
  document.getElementById("modal-tag").textContent = tagLabel;

  img.classList.add("hidden");

  const hasBlocks = article.blocks && article.blocks.some(b => b.img || b.text);

  if (hasBlocks) {
    body.innerHTML = article.blocks.map(b =>
      (b.img ? `<img src="${b.img}" alt="" style="width:100%;border-radius:14px;margin-bottom:14px;object-fit:cover;max-height:320px" onerror="this.style.display='none'">` : "") +
      (b.text ? `<p style="margin-bottom:20px;white-space:pre-wrap;line-height:1.8;font-size:15px">${b.text}</p>` : "")
    ).join("");
    if (article.content) body.innerHTML += `<p style="white-space:pre-wrap;line-height:1.8;font-size:15px;margin-top:16px">${article.content}</p>`;
  } else if (article.content) {
    body.innerHTML = `<p style="white-space:pre-wrap;line-height:1.8;font-size:15px">${article.content}</p>`;
    if (article.imageUrl) { img.src = article.imageUrl; img.classList.remove("hidden"); }
  } else {
    body.innerHTML = `<p style="color:var(--muted);font-size:15px">Текст статті відсутній</p>`;
  }

  // Social links for promo
  if (links) {
    const socials = [];
    if (article.instagram) socials.push(`<a href="${article.instagram}" target="_blank" class="social-link">📸 Instagram</a>`);
    if (article.telegram)  socials.push(`<a href="${article.telegram}" target="_blank" class="social-link">✈️ Telegram</a>`);
    if (article.tiktok)    socials.push(`<a href="${article.tiktok}" target="_blank" class="social-link">🎵 TikTok</a>`);
    if (article.website)   socials.push(`<a href="${article.website}" target="_blank" class="social-link btn-accent">Перейти →</a>`);
    if (article.monoUrl)   socials.push(`<a href="${article.monoUrl}" target="_blank" class="social-link btn-donate">💛 Підтримати</a>`);
    links.innerHTML = socials.length ? `<div class="modal-social-row">${socials.join("")}</div>` : "";
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

window._filterArticles = window.filterArticles = function(category, subcat, btn) {
  document.querySelectorAll("#" + category + "-body .subcat-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderArticles(category, articlesCache[category] || [], subcat);
};

window._toggleSection = window.toggleSection = function(bodyId) {
  const body  = document.getElementById(bodyId);
  const arrow = document.getElementById("arrow-" + bodyId);
  const catId = bodyId.replace("-body","");

  if (body.classList.contains("open")) {
    body.classList.remove("open");
    if (arrow) arrow.classList.remove("open");
  } else {
    body.classList.add("open");
    if (arrow) arrow.classList.add("open");
    if (catId === "cooking" && typeof initCalcUI === "function") {
      setTimeout(() => initCalcUI("bju-calc-wrap"), 50);
    }
    if (!articlesCache[catId]) {
      loadArticles(catId).then(articles => {
        articlesCache[catId] = articles;
        renderArticles(catId, articles);
      });
    }
  }
};

window._scrollToSection = window.scrollToSection = function(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior:"smooth", block:"start" });
  const bodyEl = document.getElementById(id + "-body");
  if (bodyEl && !bodyEl.classList.contains("open")) window._toggleSection(id + "-body");
  document.querySelectorAll(".cat-nav-btn").forEach(b => {
    b.classList.toggle("active", (b.getAttribute("onclick")||"").includes("'" + id + "'"));
  });
};

window.addEventListener("DOMContentLoaded", () => {
  const firstBody  = document.getElementById("moms-body");
  const firstArrow = document.getElementById("arrow-moms-body");
  if (firstBody)  firstBody.classList.add("open");
  if (firstArrow) firstArrow.classList.add("open");
  loadArticles("moms").then(articles => renderArticles("moms", articles));
});

window.addEventListener("scroll", () => {
  let current = "";
  ALL_CATEGORIES.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top < 200) current = id;
  });
  if (current) {
    document.querySelectorAll(".cat-nav-btn").forEach(b => {
      b.classList.toggle("active", (b.getAttribute("onclick")||"").includes("'" + current + "'"));
    });
  }
});
