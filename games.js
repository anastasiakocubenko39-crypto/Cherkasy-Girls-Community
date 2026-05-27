// ── ДАНІ ──
const UK_ALPHABET = [
  {l:"А",w:"Авокадо",e:"🥑"},{l:"Б",w:"Банан",e:"🍌"},{l:"В",w:"Вишня",e:"🍒"},
  {l:"Г",w:"Гриб",e:"🍄"},{l:"Ґ",w:"Ґудзик",e:"🔘"},{l:"Д",w:"Диня",e:"🍈"},{l:"Е",w:"Ель",e:"🌲"},
  {l:"Є",w:"Єнот",e:"🦝"},{l:"Ж",w:"Жираф",e:"🦒"},{l:"З",w:"Зебра",e:"🦓"},
  {l:"И",w:"Ирис",e:"🌸"},{l:"І",w:"Іграшка",e:"🧸"},{l:"Ї",w:"Їжак",e:"🦔"},
  {l:"Й",w:"Йогурт",e:"🥛"},{l:"К",w:"Кіт",e:"🐱"},{l:"Л",w:"Лимон",e:"🍋"},
  {l:"М",w:"Морква",e:"🥕"},{l:"Н",w:"Нарцис",e:"🌼"},{l:"О",w:"Олень",e:"🦌"},
  {l:"П",w:"Папуга",e:"🦜"},{l:"Р",w:"Риба",e:"🐟"},{l:"С",w:"Сонце",e:"☀️"},
  {l:"Т",w:"Тигр",e:"🐯"},{l:"У",w:"Улюбленець",e:"🐹"},{l:"Ф",w:"Фламінго",e:"🦩"},
  {l:"Х",w:"Хом'як",e:"🐹"},{l:"Ц",w:"Цибуля",e:"🧅"},{l:"Ч",w:"Черепаха",e:"🐢"},
  {l:"Ш",w:"Шоколад",e:"🍫"},{l:"Щ",w:"Щука",e:"🐟"},{l:"Ь",w:"М'ята",e:"🌿"},
  {l:"Ю",w:"Юла",e:"🌀"},{l:"Я",w:"Яблуко",e:"🍎"},
];

const EN_ALPHABET = [
  {l:"A",w:"Apple",e:"🍎"},{l:"B",w:"Bear",e:"🐻"},{l:"C",w:"Cat",e:"🐱"},
  {l:"D",w:"Dog",e:"🐶"},{l:"E",w:"Elephant",e:"🐘"},{l:"F",w:"Fox",e:"🦊"},
  {l:"G",w:"Giraffe",e:"🦒"},{l:"H",w:"Horse",e:"🐴"},{l:"I",w:"Ice cream",e:"🍦"},
  {l:"J",w:"Jellyfish",e:"🪼"},{l:"K",w:"Kangaroo",e:"🦘"},{l:"L",w:"Lion",e:"🦁"},
  {l:"M",w:"Monkey",e:"🐒"},{l:"N",w:"Nest",e:"🪹"},{l:"O",w:"Owl",e:"🦉"},
  {l:"P",w:"Penguin",e:"🐧"},{l:"Q",w:"Queen",e:"👸"},{l:"R",w:"Rainbow",e:"🌈"},
  {l:"S",w:"Sun",e:"☀️"},{l:"T",w:"Tiger",e:"🐯"},{l:"U",w:"Umbrella",e:"☂️"},
  {l:"V",w:"Violet",e:"💜"},{l:"W",w:"Wolf",e:"🐺"},{l:"X",w:"Xylophone",e:"🎵"},
  {l:"Y",w:"Yacht",e:"⛵"},{l:"Z",w:"Zebra",e:"🦓"},
];

const NUMBERS = [
  {n:1,e:"🐱"},{n:2,e:"🐶"},{n:3,e:"🐰"},{n:4,e:"🐻"},{n:5,e:"🦊"},
  {n:6,e:"🐸"},{n:7,e:"🐼"},{n:8,e:"🦋"},{n:9,e:"🌸"},{n:10,e:"⭐"},
  {n:11,e:"🌈"},{n:12,e:"🎈"},{n:13,e:"🍕"},{n:14,e:"🎂"},{n:15,e:"🏆"},
  {n:16,e:"🌺"},{n:17,e:"🦄"},{n:18,e:"🐠"},{n:19,e:"🌙"},{n:20,e:"☀️"},
];

const MEMORY_SETS = [
  ["🐱","🐶","🐰","🐻"],
  ["🦊","🐸","🦋","🌸"],
  ["🍎","🍌","🍒","🍋"],
  ["⭐","🌈","🎈","🏆"],
];

const ACHIEVEMENTS = [
  {id:"first_letter",name:"Перша буква",desc:"Вивчи першу букву",icon:"🔤"},
  {id:"uk_alphabet",name:"Алфавіт",desc:"Пройди всі букви",icon:"📚"},
  {id:"en_alphabet",name:"ABC Master",desc:"Англійський алфавіт",icon:"🇬🇧"},
  {id:"numbers_10",name:"Рахівничок",desc:"Числа до 10",icon:"🔢"},
  {id:"numbers_20",name:"Математик",desc:"Числа до 20",icon:"🧮"},
  {id:"math_10",name:"Додавачок",desc:"10 правильних відповідей",icon:"➕"},
  {id:"math_50",name:"Математичний геній",desc:"50 прикладів",icon:"🧠"},
  {id:"memory_1",name:"Уважність",desc:"Виграй у пам'ять",icon:"🧩"},
  {id:"memory_5",name:"Суперпам'ять",desc:"5 перемог в пам'ять",icon:"💫"},
  {id:"star_100",name:"Зіркочка",desc:"Збери 100 зірок",icon:"⭐"},
];

// ── СТАН ──
let state = JSON.parse(localStorage.getItem("cgc_kids_state") || "{}");
state.scores     = state.scores     || {};
state.unlocked   = state.unlocked   || [];
state.totalStars = state.totalStars || 0;

function saveState() { localStorage.setItem("cgc_kids_state", JSON.stringify(state)); }

// ── НАВІГАЦІЯ ──
let currentGame = null;

window.openGame = function(gameId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(`game-${gameId}`).classList.add("active");
  currentGame = gameId;
  initGame(gameId);
};

window.goHome = function() {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById("mainScreen").classList.add("active");
  document.getElementById("resultOverlay").classList.add("hidden");
  currentGame = null;
  updateMainScreen();
  // Scroll to top
  window.scrollTo({top: 0, behavior: "smooth"});
};

function updateMainScreen() {
  Object.keys(state.scores).forEach(key => {
    const el = document.getElementById(`stars-${key}`);
    if (el) el.textContent = "⭐".repeat(Math.min(3, state.scores[key] || 0));
  });
}

// ── ІНІЦІАЛІЗАЦІЯ ІГОР ──
function initGame(gameId) {
  switch(gameId) {
    case "alphabet-uk":  initAlphabet("uk"); break;
    case "alphabet-en":  initAlphabet("en"); break;
    case "numbers":      initNumbers(); break;
    case "math":         initMath("add"); break;
    case "memory":       initMemory(); break;
    case "achievements": renderAchievements(); break;
  }
}

// ══ АЛФАВІТ ══
let alphaIdx = { uk:0, en:0 };

function initAlphabet(lang) {
  alphaIdx[lang] = 0;
  renderLetter(lang);
}

function renderLetter(lang) {
  const data  = lang === "uk" ? UK_ALPHABET : EN_ALPHABET;
  const gameId = `alphabet-${lang}`;
  const area  = document.getElementById(`area-${gameId}`);
  const prog  = document.getElementById(`prog-${gameId}`);
  const idx   = alphaIdx[lang];
  const item  = data[idx];
  const pct   = ((idx) / data.length) * 100;
  prog.style.width = pct + "%";

  area.innerHTML = `
    <div class="letter-display">
      <span class="big-letter">${item.l}</span>
      <div class="letter-word">${item.w}</div>
      <span class="letter-emoji">${item.e}</span>
    </div>
    <div class="letter-counter">${idx+1} / ${data.length}</div>
    <div class="letter-nav" style="margin-top:32px">
      ${idx > 0 ? `<button class="nav-btn secondary" onclick="prevLetter('${lang}')">← Назад</button>` : ""}
      <button class="nav-btn" onclick="nextLetter('${lang}')">
        ${idx < data.length-1 ? "Далі →" : "Готово! 🎉"}
      </button>
    </div>`;
}

window.nextLetter = function(lang) {
  const data = lang === "uk" ? UK_ALPHABET : EN_ALPHABET;
  const gameId = `alphabet-${lang}`;
  if (alphaIdx[lang] < data.length - 1) {
    alphaIdx[lang]++;
    renderLetter(lang);
    addScore(gameId, 1);
  } else {
    addScore(gameId, 5);
    unlock(lang === "uk" ? "uk_alphabet" : "en_alphabet");
    showResult("🎉","Чудово!",`Ти вивчила весь ${lang === "uk" ? "Український" : "Англійський"} алфавіт!`, 3);
  }
};

window.prevLetter = function(lang) {
  if (alphaIdx[lang] > 0) { alphaIdx[lang]--; renderLetter(lang); }
};

// ══ ЦИФРИ ══
let numberIdx = 0;

function initNumbers() {
  numberIdx = 0;
  renderNumber();
}

function renderNumber() {
  const area = document.getElementById("area-numbers");
  const prog = document.getElementById("prog-numbers");
  const item = NUMBERS[numberIdx];
  prog.style.width = (numberIdx / NUMBERS.length * 100) + "%";

  let dots = "";
  for (let i = 0; i < item.n; i++) {
    dots += `<div class="dot" style="animation-delay:${i*0.05}s">${item.e}</div>`;
  }

  area.innerHTML = `
    <div class="number-display">
      <div class="big-number">${item.n}</div>
      <div class="number-dots">${dots}</div>
    </div>
    <div class="letter-counter">${numberIdx+1} / ${NUMBERS.length}</div>
    <div class="letter-nav" style="margin-top:24px">
      ${numberIdx > 0 ? `<button class="nav-btn secondary" onclick="prevNumber()">← Назад</button>` : ""}
      <button class="nav-btn" onclick="nextNumber()">
        ${numberIdx < NUMBERS.length-1 ? "Далі →" : "Готово! 🎉"}
      </button>
    </div>`;
}

window.nextNumber = function() {
  if (numberIdx < NUMBERS.length-1) {
    numberIdx++;
    renderNumber();
    addScore("numbers", 1);
    if (numberIdx === 10) unlock("numbers_10");
    if (numberIdx === 20) { unlock("numbers_20"); }
  } else {
    addScore("numbers", 5);
    showResult("🔢","Молодець!","Ти вивчила всі цифри від 1 до 20!",3);
  }
};

window.prevNumber = function() { if (numberIdx > 0) { numberIdx--; renderNumber(); } };

// ══ МАТЕМАТИКА ══
let mathLevel = "add";
let mathScore = 0;
let mathTotal = 0;
let mathCorrect = 0;
let mathAnswer = 0;
const MATH_ROUNDS = 10;

window.setMathLevel = function(level, btn) {
  mathLevel = level;
  document.querySelectorAll(".level-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  mathScore = 0; mathTotal = 0; mathCorrect = 0;
  document.getElementById("score-math").textContent = 0;
  document.getElementById("prog-math").style.width = "0%";
  renderMathQuestion();
};

function initMath(level) {
  mathLevel = level; mathScore = 0; mathTotal = 0; mathCorrect = 0;
  renderMathQuestion();
}

function renderMathQuestion() {
  const area = document.getElementById("area-math");
  const prog = document.getElementById("prog-math");
  prog.style.width = (mathTotal / MATH_ROUNDS * 100) + "%";

  let a, b, expr, ans;
  switch(mathLevel) {
    case "add": a=rnd(1,10); b=rnd(1,10); ans=a+b; expr=`${a} + ${b} = ?`; break;
    case "sub": a=rnd(5,15); b=rnd(1,a); ans=a-b; expr=`${a} − ${b} = ?`; break;
    case "mul": a=rnd(1,9); b=rnd(1,9); ans=a*b; expr=`${a} × ${b} = ?`; break;
    case "div": b=rnd(1,9); ans=rnd(1,9); a=ans*b; expr=`${a} ÷ ${b} = ?`; break;
  }
  mathAnswer = ans;

  // Варіанти відповідей
  const opts = new Set([ans]);
  while(opts.size < 4) {
    let w = ans + rnd(-5,5);
    if (w > 0 && w !== ans) opts.add(w);
  }
  const options = shuffle([...opts]);

  area.innerHTML = `
    <div class="math-question">
      <div class="math-expr">${expr}</div>
      <div class="math-options">
        ${options.map(o => `<button class="math-opt" onclick="checkMath(${o},this)">${o}</button>`).join("")}
      </div>
    </div>
    <div class="letter-counter" style="margin-top:12px">Раунд ${mathTotal+1} / ${MATH_ROUNDS}</div>`;
}

window.checkMath = function(val, btn) {
  const btns = document.querySelectorAll(".math-opt");
  btns.forEach(b => b.disabled = true);

  if (val === mathAnswer) {
    btn.classList.add("correct");
    mathCorrect++;
    addScore("math", 2);
    unlock("math_10");
  } else {
    btn.classList.add("wrong");
    btns.forEach(b => { if (parseInt(b.textContent) === mathAnswer) b.classList.add("correct"); });
  }
  mathTotal++;

  setTimeout(() => {
    if (mathTotal >= MATH_ROUNDS) {
      const stars = mathCorrect >= 9 ? 3 : mathCorrect >= 7 ? 2 : 1;
      showResult("🧮","Раунд завершено!",`Правильних відповідей: ${mathCorrect} / ${MATH_ROUNDS}`, stars);
    } else {
      renderMathQuestion();
    }
  }, 800);
};

// ══ ПАМ'ЯТЬ ══
let memoryCards = [];
let memoryFlipped = [];
let memoryMatched = 0;
let memoryMoves = 0;
let memoryLocked = false;
let memoryLevel = 0;

function initMemory() {
  memoryLevel = 0;
  startMemoryLevel();
}

function startMemoryLevel() {
  const sizes = [8, 12, 16];
  const size = sizes[Math.min(memoryLevel, sizes.length-1)];
  const area = document.getElementById("area-memory");
  const prog = document.getElementById("prog-memory");
  prog.style.width = (memoryLevel / 3 * 100) + "%";

  memoryFlipped = []; memoryMatched = 0; memoryMoves = 0; memoryLocked = false;

  // Збираємо емодзі
  let emojis = [];
  MEMORY_SETS.forEach(s => emojis.push(...s));
  emojis = emojis.slice(0, size/2);
  const cards = shuffle([...emojis, ...emojis]);
  memoryCards = cards;

  area.innerHTML = `
    <div class="memory-grid size-${size}" id="memGrid">
      ${cards.map((e,i) => `
        <div class="memory-card" id="mc-${i}" onclick="flipCard(${i})">
          <div class="memory-card-front">❓</div>
          <div class="memory-card-back">${e}</div>
        </div>`).join("")}
    </div>
    <div class="letter-counter" style="margin-top:16px">Рівень ${memoryLevel+1} · Ходів: <span id="moves">0</span></div>`;
}

window.flipCard = function(idx) {
  if (memoryLocked) return;
  const card = document.getElementById(`mc-${idx}`);
  if (card.classList.contains("flipped") || card.classList.contains("matched")) return;
  card.classList.add("flipped");
  memoryFlipped.push(idx);

  if (memoryFlipped.length === 2) {
    memoryLocked = true;
    memoryMoves++;
    document.getElementById("moves").textContent = memoryMoves;
    const [a, b] = memoryFlipped;
    if (memoryCards[a] === memoryCards[b]) {
      document.getElementById(`mc-${a}`).classList.replace("flipped","matched");
      document.getElementById(`mc-${b}`).classList.replace("flipped","matched");
      memoryMatched++;
      memoryFlipped = [];
      memoryLocked = false;
      addScore("memory", 3);
      if (memoryMatched === memoryCards.length/2) {
        setTimeout(() => {
          memoryLevel++;
          unlock("memory_1");
          if (memoryLevel >= 3) {
            unlock("memory_5");
            showResult("🧩","Супер пам'ять!",`Ти завершила всі рівні за ${memoryMoves} ходів!`, 3);
          } else {
            showResult("🎉",`Рівень ${memoryLevel} пройдено!`,`За ${memoryMoves} ходів. Далі складніше!`, 2);
          }
        }, 500);
      }
    } else {
      setTimeout(() => {
        document.getElementById(`mc-${a}`).classList.remove("flipped");
        document.getElementById(`mc-${b}`).classList.remove("flipped");
        memoryFlipped = [];
        memoryLocked = false;
      }, 900);
    }
  }
};

// ══ ДОСЯГНЕННЯ ══
function renderAchievements() {
  const area = document.getElementById("achievements-area");
  area.innerHTML = `
    <h3 style="font-family:'Fredoka One',cursive;font-size:20px;margin-bottom:24px;color:#c4b5e8">
      Зірок зібрано: ${state.totalStars} ⭐
    </h3>
    <div class="achieve-grid">
      ${ACHIEVEMENTS.map(a => `
        <div class="achieve-card ${state.unlocked.includes(a.id) ? "unlocked" : ""}">
          <span class="achieve-icon">${a.icon}</span>
          <div class="achieve-name">${a.name}</div>
          <div class="achieve-desc">${a.desc}</div>
        </div>`).join("")}
    </div>`;
}

// ══ РЕЗУЛЬТАТ ══
function showResult(emoji, title, text, stars) {
  document.getElementById("resultEmoji").textContent = emoji;
  document.getElementById("resultTitle").textContent = title;
  document.getElementById("resultText").textContent = text;
  document.getElementById("resultStars").textContent = "⭐".repeat(stars);
  document.getElementById("resultOverlay").classList.remove("hidden");
}

window.nextLevel = function() {
  document.getElementById("resultOverlay").classList.add("hidden");
  if (currentGame === "memory" && memoryLevel < 3) {
    startMemoryLevel();
  } else if (currentGame === "sentences") {
    renderSentence();
  } else if (currentGame === "tales") {
    renderTale();
  } else if (currentGame === "dictionary") {
    renderDict();
  } else if (currentGame === "game2048") {
    init2048();
  } else if (currentGame) {
    initGame(currentGame);
  }
};

// ══ ХЕЛПЕРИ ══
function rnd(min, max) { return Math.floor(Math.random() * (max-min+1)) + min; }

function shuffle(arr) {
  for (let i = arr.length-1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
  return arr;
}

function addScore(gameId, pts) {
  state.scores[gameId] = (state.scores[gameId] || 0) + pts;
  state.totalStars += pts;
  const el = document.getElementById(`score-${gameId}`);
  if (el) el.textContent = state.scores[gameId];
  if (state.totalStars >= 100) unlock("star_100");
  saveState();
}

function unlock(achieveId) {
  if (!state.unlocked.includes(achieveId)) {
    state.unlocked.push(achieveId);
    saveState();
  }
}

// ── ІНІТ ──
updateMainScreen();

// ══════════════════════════════════════
// РЕЧЕННЯ
// ══════════════════════════════════════
const SENTENCES_UK = [
  {orig:"Сонце світить яскраво",words:["Сонце","світить","яскраво","хмара","дощ"]},
  {orig:"Кіт спить на дивані",words:["Кіт","спить","на","дивані","бігає","дерево"]},
  {orig:"Діти грають у парку",words:["Діти","грають","у","парку","школі","сплять"]},
  {orig:"Мама готує смачний обід",words:["Мама","готує","смачний","обід","вечеря","тато"]},
  {orig:"Пташка співає пісню",words:["Пташка","співає","пісню","танцює","риба","кіт"]},
  {orig:"Хлопчик читає цікаву книгу",words:["Хлопчик","читає","цікаву","книгу","малює","нудну"]},
  {orig:"Собака біжить швидко",words:["Собака","біжить","швидко","повільно","кіт","стрибає"]},
  {orig:"Квіти ростуть у саду",words:["Квіти","ростуть","у","саду","полі","падають"]},
  {orig:"Зайчик їсть моркву",words:["Зайчик","їсть","моркву","капусту","лисиця","спить"]},
  {orig:"Дівчинка малює будинок",words:["Дівчинка","малює","будинок","дерево","хлопчик","співає"]},
  {orig:"Кошеня грає з клубком",words:["Кошеня","грає","з","клубком","мишкою","спить"]},
  {orig:"Ведмідь живе у лісі",words:["Ведмідь","живе","у","лісі","горах","полі"]},
  {orig:"Риба плаває у річці",words:["Риба","плаває","у","річці","морі","озері"]},
  {orig:"Хмари пливуть по небу",words:["Хмари","пливуть","по","небу","полю","морю"]},
  {orig:"Дощ іде надворі",words:["Дощ","іде","надворі","вдома","сьогодні","вчора"]},
  {orig:"Бджола збирає мед",words:["Бджола","збирає","мед","нектар","пилок","квіти"]},
  {orig:"Метелик літає над квіткою",words:["Метелик","літає","над","квіткою","деревом","садом"]},
  {orig:"Черепаха повзе повільно",words:["Черепаха","повзе","повільно","швидко","обережно","тихо"]},
  {orig:"Жаба стрибає у болото",words:["Жаба","стрибає","у","болото","воду","траву"]},
  {orig:"Білочка їсть горіхи",words:["Білочка","їсть","горіхи","гриби","ягоди","шишки"]},
  {orig:"Тато читає газету",words:["Тато","читає","газету","книгу","журнал","вранці"]},
  {orig:"Бабуся пече пиріг",words:["Бабуся","пече","пиріг","торт","хліб","печиво"]},
  {orig:"Дідусь садить квіти",words:["Дідусь","садить","квіти","дерева","овочі","яблука"]},
  {orig:"Сестра малює картину",words:["Сестра","малює","картину","будинок","квіти","природу"]},
  {orig:"Брат грає у футбол",words:["Брат","грає","у","футбол","теніс","баскетбол"]},
  {orig:"Кінь їсть траву",words:["Кінь","їсть","траву","сіно","овес","яблука"]},
  {orig:"Корова дає молоко",words:["Корова","дає","молоко","тепло","сметану","вранці"]},
  {orig:"Курка знесла яйце",words:["Курка","знесла","яйце","два","три","яєчко"]},
  {orig:"Свиня валяється у багнюці",words:["Свиня","валяється","у","багнюці","болоті","воді"]},
  {orig:"Вовк бігає по лісу",words:["Вовк","бігає","по","лісу","полю","степу"]},
  {orig:"Лисиця хитра і руда",words:["Лисиця","хитра","і","руда","спритна","красива"]},
  {orig:"Їжак знайшов гриб",words:["Їжак","знайшов","гриб","яблуко","грушу","листок"]},
  {orig:"Зима принесла сніг",words:["Зима","принесла","сніг","холод","мороз","лід"]},
  {orig:"Весна прийшла у ліс",words:["Весна","прийшла","у","ліс","місто","сад"]},
  {orig:"Літо дарує тепло",words:["Літо","дарує","тепло","радість","сонце","відпочинок"]},
  {orig:"Осінь фарбує листя",words:["Осінь","фарбує","листя","дерева","ліс","парк"]},
  {orig:"Місяць світить вночі",words:["Місяць","світить","вночі","яскраво","тихо","гарно"]},
  {orig:"Зірки мигають на небі",words:["Зірки","мигають","на","небі","горизонті","морі"]},
  {orig:"Вітер гойдає дерева",words:["Вітер","гойдає","дерева","гілки","квіти","траву"]},
  {orig:"Хлопчик купається в морі",words:["Хлопчик","купається","в","морі","річці","озері"]},
  {orig:"Дівчинка збирає квіти",words:["Дівчинка","збирає","квіти","ягоди","гриби","яблука"]},
  {orig:"Кролик вуха довгі має",words:["Кролик","вуха","довгі","має","пухнасті","білі"]},
  {orig:"Слон великий і сильний",words:["Слон","великий","і","сильний","добрий","розумний"]},
  {orig:"Жираф має довгу шию",words:["Жираф","має","довгу","шию","шкіру","ногу"]},
  {orig:"Папуга говорить і співає",words:["Папуга","говорить","і","співає","танцює","кричить"]},
  {orig:"Черв'як живе у землі",words:["Черв'як","живе","у","землі","норі","траві"]},
  {orig:"Равлик повзе по листку",words:["Равлик","повзе","по","листку","гілці","каменю"]},
  {orig:"Мурашка несе зернятко",words:["Мурашка","несе","зернятко","листочок","крихту","гілочку"]},
  {orig:"Бабка літає над водою",words:["Бабка","літає","над","водою","квіткою","полем"]},
  {orig:"Сова спить вдень",words:["Сова","спить","вдень","вночі","у","дупло"]},
];

const SENTENCES_EN = [
  {orig:"The sun shines bright",words:["The","sun","shines","bright","cloud","rain"]},
  {orig:"The cat sleeps on the sofa",words:["The","cat","sleeps","on","sofa","runs","tree"]},
  {orig:"Children play in the park",words:["Children","play","in","the","park","school","sleep"]},
  {orig:"Mom cooks a tasty lunch",words:["Mom","cooks","a","tasty","lunch","dinner","dad"]},
  {orig:"The bird sings a song",words:["The","bird","sings","a","song","dances","fish"]},
  {orig:"The boy reads a book",words:["The","boy","reads","a","book","draws","boring"]},
  {orig:"The dog runs fast",words:["The","dog","runs","fast","slow","cat","jumps"]},
  {orig:"Flowers grow in the garden",words:["Flowers","grow","in","the","garden","field","fall"]},
  {orig:"The rabbit eats a carrot",words:["The","rabbit","eats","a","carrot","fox","sleeps"]},
  {orig:"The girl draws a house",words:["The","girl","draws","a","house","tree","boy","sings"]},
  {orig:"A butterfly flies over flowers",words:["A","butterfly","flies","over","flowers","trees","field"]},
  {orig:"The bear lives in the forest",words:["The","bear","lives","in","forest","mountains","river"]},
  {orig:"Fish swim in the river",words:["Fish","swim","in","the","river","sea","lake"]},
  {orig:"Clouds float in the sky",words:["Clouds","float","in","the","sky","wind","above"]},
  {orig:"It rains outside today",words:["It","rains","outside","today","yesterday","morning","evening"]},
  {orig:"The bee collects honey",words:["The","bee","collects","honey","nectar","pollen","flowers"]},
  {orig:"The turtle moves slowly",words:["The","turtle","moves","slowly","quickly","carefully","quietly"]},
  {orig:"The frog jumps into water",words:["The","frog","jumps","into","water","grass","pond"]},
  {orig:"The squirrel eats nuts",words:["The","squirrel","eats","nuts","mushrooms","berries","seeds"]},
  {orig:"Grandma bakes a cake",words:["Grandma","bakes","a","cake","pie","bread","cookies"]},
  {orig:"Grandpa plants flowers",words:["Grandpa","plants","flowers","trees","vegetables","apples"]},
  {orig:"My sister draws a picture",words:["My","sister","draws","a","picture","house","garden"]},
  {orig:"My brother plays football",words:["My","brother","plays","football","tennis","basketball","outside"]},
  {orig:"The horse eats green grass",words:["The","horse","eats","green","grass","hay","oats"]},
  {orig:"The cow gives us milk",words:["The","cow","gives","us","milk","cream","butter"]},
  {orig:"Winter brings snow and ice",words:["Winter","brings","snow","and","ice","cold","frost"]},
  {orig:"Spring comes to the forest",words:["Spring","comes","to","the","forest","city","garden"]},
  {orig:"Summer gives us warm days",words:["Summer","gives","us","warm","days","sunshine","holidays"]},
  {orig:"Autumn colors the leaves",words:["Autumn","colors","the","leaves","trees","forest","park"]},
  {orig:"The moon shines at night",words:["The","moon","shines","at","night","brightly","quietly"]},
  {orig:"Stars twinkle in the sky",words:["Stars","twinkle","in","the","sky","horizon","darkness"]},
  {orig:"Wind shakes the tall trees",words:["Wind","shakes","the","tall","trees","branches","flowers"]},
  {orig:"The elephant is big and strong",words:["The","elephant","is","big","and","strong","gentle","wise"]},
  {orig:"The giraffe has a long neck",words:["The","giraffe","has","a","long","neck","tail","tongue"]},
  {orig:"The parrot talks and sings",words:["The","parrot","talks","and","sings","dances","screams"]},
  {orig:"An ant carries a seed",words:["An","ant","carries","a","seed","leaf","crumb","twig"]},
  {orig:"The owl sleeps during the day",words:["The","owl","sleeps","during","the","day","night","tree"]},
  {orig:"A snail crawls on a leaf",words:["A","snail","crawls","on","a","leaf","branch","stone"]},
  {orig:"The wolf runs through the forest",words:["The","wolf","runs","through","the","forest","field","night"]},
  {orig:"The fox is clever and red",words:["The","fox","is","clever","and","red","quick","sly"]},
  {orig:"The hedgehog found a mushroom",words:["The","hedgehog","found","a","mushroom","apple","pear","leaf"]},
  {orig:"The dragonfly flies over water",words:["The","dragonfly","flies","over","water","flowers","pond"]},
  {orig:"A little girl picks berries",words:["A","little","girl","picks","berries","mushrooms","flowers","apples"]},
  {orig:"The kitten plays with a ball",words:["The","kitten","plays","with","a","ball","string","toy"]},
  {orig:"Dad reads a newspaper",words:["Dad","reads","a","newspaper","book","magazine","morning"]},
  {orig:"We swim in the blue sea",words:["We","swim","in","the","blue","sea","river","pool"]},
  {orig:"The pig rolls in the mud",words:["The","pig","rolls","in","the","mud","water","grass"]},
  {orig:"The hen laid an egg",words:["The","hen","laid","an","egg","two","three","morning"]},
  {orig:"The parrot has colorful feathers",words:["The","parrot","has","colorful","feathers","wings","beak","tail"]},
  {orig:"A rainbow appears after rain",words:["A","rainbow","appears","after","rain","storm","clouds"]},
  {orig:"The worm lives in the ground",words:["The","worm","lives","in","the","ground","soil","dirt"]},
];

let sentenceLang = "uk";
let sentenceIdx  = 0;
let builtSentence = [];

window.setSentenceLang = function(lang, btn) {
  sentenceLang = lang;
  sentenceIdx  = 0;
  builtSentence = [];
  document.querySelectorAll("#game-sentences .level-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderSentence();
};

function initSentences() {
  sentenceLang = "uk"; sentenceIdx = 0; builtSentence = [];
  renderSentence();
}

function renderSentence() {
  const data  = sentenceLang === "uk" ? SENTENCES_UK : SENTENCES_EN;
  const area  = document.getElementById("area-sentences");
  const prog  = document.getElementById("prog-sentences");
  const item  = data[sentenceIdx % data.length];
  prog.style.width = ((sentenceIdx % data.length) / data.length * 100) + "%";
  builtSentence = [];

  const words = shuffle([...item.words]);
  area.innerHTML = `
    <div class="sentence-card">
      <div class="sentence-original">${item.orig}</div>
      <div class="sentence-hint">Склади це речення зі слів нижче</div>
      <div class="sentence-builder" id="sent-builder">
        <span style="color:rgba(255,255,255,.3);font-size:13px">Натискай слова...</span>
      </div>
      <div class="word-bank">
        ${words.map((w,i) => `<button class="word-chip" id="wc-${i}" onclick="addWord('${w}',${i})">${w}</button>`).join("")}
      </div>
      <button class="check-sentence-btn" onclick="checkSentence('${item.orig.replace(/'/g,"\'")}')">Перевірити ✓</button>
    </div>
    <div class="letter-counter">${sentenceIdx % data.length + 1} / ${data.length}</div>`;
}

window.addWord = function(word, idx) {
  builtSentence.push(word);
  document.getElementById(`wc-${idx}`).classList.add("used");
  const builder = document.getElementById("sent-builder");
  builder.innerHTML = builtSentence.map((w,i) =>
    `<span class="placed-word" onclick="removeWord(${i})">${w}</span>`
  ).join("") || `<span style="color:rgba(255,255,255,.3);font-size:13px">Натискай слова...</span>`;
};

window.removeWord = function(idx) {
  const word = builtSentence[idx];
  builtSentence.splice(idx, 1);
  // Re-enable chip
  const chips = document.querySelectorAll(".word-chip");
  chips.forEach(c => { if (c.textContent === word && c.classList.contains("used")) { c.classList.remove("used"); } });
  const builder = document.getElementById("sent-builder");
  builder.innerHTML = builtSentence.map((w,i) =>
    `<span class="placed-word" onclick="removeWord(${i})">${w}</span>`
  ).join("") || `<span style="color:rgba(255,255,255,.3);font-size:13px">Натискай слова...</span>`;
};

window.checkSentence = function(correct) {
  const built = builtSentence.join(" ");
  const area  = document.getElementById("area-sentences");
  const data  = sentenceLang === "uk" ? SENTENCES_UK : SENTENCES_EN;

  if (built === correct) {
    addScore("sentences", 3);
    // Flash green then next
    const card = area.querySelector(".sentence-card");
    if (card) {
      card.style.background = "linear-gradient(135deg,rgba(52,211,153,.15),rgba(132,204,22,.1))";
      card.style.border = "3px solid rgba(52,211,153,.5)";
    }
    sentenceIdx++;
    setTimeout(() => {
      if (sentenceIdx >= data.length) {
        sentenceIdx = 0;
        showResult("🎉","Чудово!","Ти склала всі речення правильно!",3);
      } else {
        renderSentence();
      }
    }, 600);
  } else {
    // Flash red hint
    const card = area.querySelector(".sentence-card");
    if (card) {
      card.style.border = "3px solid rgba(251,113,133,.5)";
      setTimeout(() => { card.style.border = ""; }, 800);
    }
    // Show correct answer hint
    const hint = document.createElement("div");
    hint.style.cssText = "margin-top:12px;padding:12px 16px;background:rgba(251,113,133,.1);border-radius:12px;font-size:15px;color:#c0392b;font-weight:700;text-align:center;";
    hint.textContent = `Правильно: "${correct}"`;
    const checkBtn = area.querySelector(".check-sentence-btn");
    if (checkBtn) checkBtn.parentNode.insertBefore(hint, checkBtn.nextSibling);
    setTimeout(() => hint.remove(), 2000);
  }
};

// ══════════════════════════════════════
// КАЗКИ
// ══════════════════════════════════════
const TALES_UK = [
  {title:"Курочка Ряба",emoji:"🐔",text:`Жили собі дід та баба. Була в них курочка Ряба.\n\nЗнесла курочка яєчко — не просте, а золоте!\n\nДід бив-бив — не розбив. Баба била-білa — не розбила.\n\nМишка бігла, хвостиком махнула — яєчко впало і розбилось.\n\nДід плаче, баба плаче, а курочка кудкудаче:\n\n— Не плачте, дідусю та бабусю! Я знесу вам яєчко нове — не золоте, а просте!`},
  {title:"Ріпка",emoji:"🌱",text:`Посадив дід ріпку. Виросла ріпка велика-превелика!\n\nТягне дід ріпку — тягне-потягне, витягнути не може.\n\nПокликав дід бабу. Баба за діда, дід за ріпку — тягнуть-потягнуть, витягнути не можуть.\n\nПокликала баба внучку. Внучка за бабу, баба за діда — тягнуть, витягнути не можуть.\n\nПокликала внучка Жучку. Жучка за внучку... Покликала Жучка кішку, кішка — мишку.\n\nМишка за кішку — і витягнули ріпку!`},
  {title:"Три ведмеді",emoji:"🐻",text:`Жили в лісі три ведмеді: тато Михайло, мама Настасія і малюк Мишко.\n\nОдного дня дівчинка Маша заблукала в лісі і знайшла їхній будиночок.\n\nВона спробувала кашу: з першої миски — гаряча, з другої — холодна, з третьої — якраз!\n\nМаша з'їла кашу Мишка, посиділа на його стільці і заснула в його ліжечку.\n\nКоли ведмеді повернулися — Маша прокинулась і втекла додому!`},
];

const TALES_NATURE = [
  {
    title:"Троянда — королева квітів",
    emoji:"🌹",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Sunflower_from_Silesia2.jpg/640px-Sunflower_from_Silesia2.jpg",
    text:`Троянда — найкрасивіша квітка у світі. Вона буває червона, рожева, біла і жовта.\n\nУ троянди є гострі шипи — це її захист від тварин.\n\nПелюстки троянди дуже ніжні і пахучі. З них роблять духи та чай.\n\nТроянда любить сонце і воду. Якщо доглядати за нею — вона цвіте все літо!\n\n🌹 Троянда — символ краси і любові.`
  },
  {
    title:"Соняшник — сонячна квітка",
    emoji:"🌻",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Sunflower_sky_backdrop.jpg/640px-Sunflower_sky_backdrop.jpg",
    text:`Соняшник — висока і яскрава квітка. Вона може вирости вище за людину!\n\nСоняшник завжди повертається до сонця. Вранці він дивиться на схід, а ввечері — на захід.\n\nУ центрі соняшника — насіння. Їх їдять птахи, білки і люди.\n\nЗ насіння соняшника роблять олію для приготування їжі.\n\n🌻 Соняшник — символ України!`
  },
  {
    title:"Ромашка — лісова лікарка",
    emoji:"🌼",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Daisy_%28Bellis_perennis%29_white_3.jpg/640px-Daisy_%28Bellis_perennis%29_white_3.jpg",
    text:`Ромашка — маленька біла квітка з жовтою серединкою.\n\nВона росте на луках, у полях і садах.\n\nРомашка — справжня лікарка! З неї варять чай, який допомагає при застуді.\n\nДіти плетуть з ромашок вінки. Це давній український звичай!\n\nРомашка цвіте з весни до пізньої осені. Вона дуже невибаглива — росте скрізь!\n\n🌼 Нарви букет ромашок для мами — вона точно зрадіє!`
  },
  {
    title:"Білий гриб — цар грибів",
    emoji:"🍄",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Boletus_edulis_LA.jpg/640px-Boletus_edulis_LA.jpg",
    text:`Білий гриб — найцінніший гриб у лісі. Його ще називають боровик.\n\nВін має товсту коричневу шапку і білу товсту ніжку.\n\nБілий гриб росте під дубами та соснами. Якщо знайшов один — шукай поруч ще!\n\nЦей гриб можна варити, смажити і сушити. Сушені білі гриби пахнуть дуже смачно!\n\n⚠️ Увага: Збирати гриби можна тільки з дорослими! Є отруйні гриби, схожі на їстівні.`
  },
  {
    title:"Мухомор — красивий але небезпечний",
    emoji:"🔴",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Amanita_muscaria_2006G.jpg/640px-Amanita_muscaria_2006G.jpg",
    text:`Мухомор — найвідоміший отруйний гриб. Він яскраво-червоний з білими цятками.\n\nМухомор дуже красивий, але їсти його не можна! Він дуже отруйний.\n\nЦей гриб є лісовою аптекою для звірів. Олені і лосі іноді їдять маленькі шматочки мухомора під час хвороби.\n\nМухомор росте в лісі під березами і ялинами з липня по жовтень.\n\n⚠️ Правило: Побачив яскравий незнайомий гриб — не чіпай! Краще помилуйся здалеку.`
  },
  {
    title:"Дуб — велетень лісу",
    emoji:"🌳",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Quercus_robur_001.jpg/640px-Quercus_robur_001.jpg",
    text:`Дуб — найсильніше і найдовговічніше дерево України. Деякі дуби живуть тисячу років!\n\nДуб має широке могутнє гілля і темно-зелене листя. Восени листя стає жовтим і коричневим.\n\nПлоди дуба — жолуді. Їх дуже люблять білки та кабани.\n\nДеревина дуба дуже тверда. З неї роблять меблі, паркет і бочки для вина.\n\nУ дупло старого дуба часто оселяються птахи, їжаки і кажани.\n\n🌳 Дуб — символ сили і довголіття в Україні!`
  },
];

const TALES_EN = [
  {title:"Little Red Riding Hood",emoji:"🔴",text:`Once upon a time, a little girl lived in a village near the forest.\n\nEveryone loved her, but her grandmother loved her most of all. She gave her a red cape and hood — so everyone called her Little Red Riding Hood.\n\nOne day, her mother said: "Take this basket of food to grandmother. She is sick."\n\nOn the way, she met a wolf. He asked where she was going. She told him.\n\nThe wolf ran ahead to grandmother's house. But the woodcutters heard grandmother cry out and came to save her.\n\nAnd everyone lived happily ever after!`},
  {title:"The Three Little Pigs",emoji:"🐷",text:`Once upon a time there were three little pigs who left home to build their own houses.\n\nThe first pig built a house of straw. The second built a house of sticks. The third built a house of bricks.\n\nA big bad wolf came and said: "I'll huff and I'll puff and I'll blow your house down!"\n\nHe blew down the straw house. He blew down the stick house.\n\nBut he could not blow down the brick house! The three pigs were safe inside.\n\nThe wolf gave up and ran away. The three pigs lived happily ever after!`},
  {title:"Goldilocks",emoji:"🌟",text:`Once there was a girl named Goldilocks. One day she walked into the forest and found a house.\n\nInside she found three bowls of porridge. One was too hot, one was too cold, and one was just right — she ate it all up!\n\nShe tried three chairs. One was too big, one was too big, and one was just right — but it broke!\n\nShe went upstairs and tried three beds. One was too hard, one was too soft, and one was just right — she fell asleep.\n\nWhen the three bears came home, Goldilocks woke up and ran away as fast as she could!`},
];

let taleLang = "uk";
let taleIdx  = 0;

window.setTaleLang = function(lang, btn) {
  taleLang = lang; taleIdx = 0;
  document.querySelectorAll("#game-tales .level-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderTale();
};

function initTales() { taleLang = "uk"; taleIdx = 0; renderTale(); }

function renderTale() {
  const data = taleLang === "uk" ? TALES_UK : taleLang === "en" ? TALES_EN : TALES_NATURE;
  const area = document.getElementById("area-tales");
  const tale = data[taleIdx];
  area.innerHTML = `
    <div class="tale-card">
      ${tale.img ? `<img src="${tale.img}" alt="${tale.title}" style="width:100%;max-height:220px;object-fit:cover;border-radius:14px;margin-bottom:16px;" onerror="this.style.display='none'">` : ""}
      <span class="tale-emoji">${tale.emoji}</span>
      <div class="tale-title">${tale.title}</div>
      <div class="tale-text">${tale.text.replace(/\n\n/g,"<br><br>")}</div>
    </div>
    <div class="tale-nav">
      ${taleIdx > 0 ? `<button class="nav-btn secondary" onclick="prevTale()">← Назад</button>` : ""}
      <button class="nav-btn" onclick="nextTale()">${taleIdx < data.length-1 ? "Наступна →" : "Спочатку ↺"}</button>
    </div>
    <div class="tale-counter">${taleIdx+1} / ${data.length}</div>`;
}

window.nextTale = function() {
  const data = taleLang === "uk" ? TALES_UK : taleLang === "en" ? TALES_EN : TALES_NATURE;
  taleIdx = (taleIdx + 1) % data.length;
  addScore("tales", 2);
  renderTale();
};
window.prevTale = function() { if(taleIdx > 0) { taleIdx--; renderTale(); } };

// ══════════════════════════════════════
// СЛОВНИК
// ══════════════════════════════════════
const DICTIONARY = [
  // Фрукти
  {uk:"Яблуко",en:"Apple",e:"🍎",cat:"Фрукти"},
  {uk:"Банан",en:"Banana",e:"🍌",cat:"Фрукти"},
  {uk:"Апельсин",en:"Orange",e:"🍊",cat:"Фрукти"},
  {uk:"Полуниця",en:"Strawberry",e:"🍓",cat:"Фрукти"},
  {uk:"Виноград",en:"Grapes",e:"🍇",cat:"Фрукти"},
  {uk:"Кавун",en:"Watermelon",e:"🍉",cat:"Фрукти"},
  {uk:"Персик",en:"Peach",e:"🍑",cat:"Фрукти"},
  {uk:"Груша",en:"Pear",e:"🍐",cat:"Фрукти"},
  {uk:"Лимон",en:"Lemon",e:"🍋",cat:"Фрукти"},
  {uk:"Вишня",en:"Cherry",e:"🍒",cat:"Фрукти"},
  // Овочі
  {uk:"Морква",en:"Carrot",e:"🥕",cat:"Овочі"},
  {uk:"Помідор",en:"Tomato",e:"🍅",cat:"Овочі"},
  {uk:"Огірок",en:"Cucumber",e:"🥒",cat:"Овочі"},
  {uk:"Картопля",en:"Potato",e:"🥔",cat:"Овочі"},
  {uk:"Капуста",en:"Cabbage",e:"🥬",cat:"Овочі"},
  {uk:"Часник",en:"Garlic",e:"🧄",cat:"Овочі"},
  {uk:"Цибуля",en:"Onion",e:"🧅",cat:"Овочі"},
  {uk:"Броколі",en:"Broccoli",e:"🥦",cat:"Овочі"},
  {uk:"Перець",en:"Pepper",e:"🌶️",cat:"Овочі"},
  {uk:"Кукурудза",en:"Corn",e:"🌽",cat:"Овочі"},
  // Тварини
  {uk:"Кіт",en:"Cat",e:"🐱",cat:"Тварини"},
  {uk:"Собака",en:"Dog",e:"🐶",cat:"Тварини"},
  {uk:"Кінь",en:"Horse",e:"🐴",cat:"Тварини"},
  {uk:"Корова",en:"Cow",e:"🐮",cat:"Тварини"},
  {uk:"Слон",en:"Elephant",e:"🐘",cat:"Тварини"},
  {uk:"Лев",en:"Lion",e:"🦁",cat:"Тварини"},
  {uk:"Жираф",en:"Giraffe",e:"🦒",cat:"Тварини"},
  {uk:"Зебра",en:"Zebra",e:"🦓",cat:"Тварини"},
  {uk:"Ведмідь",en:"Bear",e:"🐻",cat:"Тварини"},
  {uk:"Вовк",en:"Wolf",e:"🐺",cat:"Тварини"},
  {uk:"Лисиця",en:"Fox",e:"🦊",cat:"Тварини"},
  {uk:"Заєць",en:"Rabbit",e:"🐰",cat:"Тварини"},
  {uk:"Їжак",en:"Hedgehog",e:"🦔",cat:"Тварини"},
  {uk:"Мавпа",en:"Monkey",e:"🐒",cat:"Тварини"},
  {uk:"Тигр",en:"Tiger",e:"🐯",cat:"Тварини"},
  // Птахи
  {uk:"Пташка",en:"Bird",e:"🐦",cat:"Птахи"},
  {uk:"Орел",en:"Eagle",e:"🦅",cat:"Птахи"},
  {uk:"Сова",en:"Owl",e:"🦉",cat:"Птахи"},
  {uk:"Пінгвін",en:"Penguin",e:"🐧",cat:"Птахи"},
  {uk:"Папуга",en:"Parrot",e:"🦜",cat:"Птахи"},
  {uk:"Лебідь",en:"Swan",e:"🦢",cat:"Птахи"},
  {uk:"Фламінго",en:"Flamingo",e:"🦩",cat:"Птахи"},
  // Квіти та рослини
  {uk:"Троянда",en:"Rose",e:"🌹",cat:"Квіти"},
  {uk:"Соняшник",en:"Sunflower",e:"🌻",cat:"Квіти"},
  {uk:"Ромашка",en:"Daisy",e:"🌼",cat:"Квіти"},
  {uk:"Тюльпан",en:"Tulip",e:"🌷",cat:"Квіти"},
  {uk:"Квітка",en:"Flower",e:"🌸",cat:"Квіти"},
  {uk:"Дерево",en:"Tree",e:"🌳",cat:"Рослини"},
  {uk:"Листок",en:"Leaf",e:"🍃",cat:"Рослини"},
  {uk:"Трава",en:"Grass",e:"🌿",cat:"Рослини"},
  {uk:"Кактус",en:"Cactus",e:"🌵",cat:"Рослини"},
  {uk:"Гриб",en:"Mushroom",e:"🍄",cat:"Рослини"},
  // Природа
  {uk:"Сонце",en:"Sun",e:"☀️",cat:"Природа"},
  {uk:"Місяць",en:"Moon",e:"🌙",cat:"Природа"},
  {uk:"Зірка",en:"Star",e:"⭐",cat:"Природа"},
  {uk:"Хмара",en:"Cloud",e:"☁️",cat:"Природа"},
  {uk:"Дощ",en:"Rain",e:"🌧️",cat:"Природа"},
  {uk:"Сніг",en:"Snow",e:"❄️",cat:"Природа"},
  {uk:"Веселка",en:"Rainbow",e:"🌈",cat:"Природа"},
  {uk:"Море",en:"Sea",e:"🌊",cat:"Природа"},
  {uk:"Гора",en:"Mountain",e:"⛰️",cat:"Природа"},
  {uk:"Вогонь",en:"Fire",e:"🔥",cat:"Природа"},
  // Транспорт
  {uk:"Машина",en:"Car",e:"🚗",cat:"Транспорт"},
  {uk:"Літак",en:"Airplane",e:"✈️",cat:"Транспорт"},
  {uk:"Корабель",en:"Ship",e:"🚢",cat:"Транспорт"},
  {uk:"Поїзд",en:"Train",e:"🚂",cat:"Транспорт"},
  {uk:"Велосипед",en:"Bicycle",e:"🚲",cat:"Транспорт"},
  {uk:"Ракета",en:"Rocket",e:"🚀",cat:"Транспорт"},
  {uk:"Вертоліт",en:"Helicopter",e:"🚁",cat:"Транспорт"},
  {uk:"Автобус",en:"Bus",e:"🚌",cat:"Транспорт"},
  // Їжа
  {uk:"Хліб",en:"Bread",e:"🍞",cat:"Їжа"},
  {uk:"Піца",en:"Pizza",e:"🍕",cat:"Їжа"},
  {uk:"Суп",en:"Soup",e:"🍲",cat:"Їжа"},
  {uk:"Торт",en:"Cake",e:"🎂",cat:"Їжа"},
  {uk:"Морозиво",en:"Ice cream",e:"🍦",cat:"Їжа"},
  {uk:"Мед",en:"Honey",e:"🍯",cat:"Їжа"},
  {uk:"Молоко",en:"Milk",e:"🥛",cat:"Їжа"},
  {uk:"Яйце",en:"Egg",e:"🥚",cat:"Їжа"},
  // Кольори
  {uk:"Червоний",en:"Red",e:"🔴",cat:"Кольори"},
  {uk:"Синій",en:"Blue",e:"🔵",cat:"Кольори"},
  {uk:"Зелений",en:"Green",e:"🟢",cat:"Кольори"},
  {uk:"Жовтий",en:"Yellow",e:"🟡",cat:"Кольори"},
  {uk:"Помаранчевий",en:"Orange",e:"🟠",cat:"Кольори"},
  {uk:"Фіолетовий",en:"Purple",e:"🟣",cat:"Кольори"},
  {uk:"Білий",en:"White",e:"⬜",cat:"Кольори"},
  {uk:"Чорний",en:"Black",e:"⬛",cat:"Кольори"},
  // Речі
  {uk:"Будинок",en:"House",e:"🏠",cat:"Речі"},
  {uk:"Книга",en:"Book",e:"📚",cat:"Речі"},
  {uk:"М'яч",en:"Ball",e:"⚽",cat:"Речі"},
  {uk:"Олівець",en:"Pencil",e:"✏️",cat:"Речі"},
  {uk:"Телефон",en:"Phone",e:"📱",cat:"Речі"},
  {uk:"Годинник",en:"Clock",e:"⏰",cat:"Речі"},
  {uk:"Рюкзак",en:"Backpack",e:"🎒",cat:"Речі"},
  {uk:"Ключ",en:"Key",e:"🔑",cat:"Речі"},
  {uk:"Музика",en:"Music",e:"🎵",cat:"Речі"},
  {uk:"М'яч",en:"Ball",e:"🏀",cat:"Спорт"},
];

let dictMode = "learn";
let dictIdx  = 0;
let dictQuizAnswer = "";

window.setDictMode = function(mode, btn) {
  dictMode = mode; dictIdx = 0;
  document.querySelectorAll("#game-dictionary .level-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderDict();
};

function initDictionary() { dictMode = "learn"; dictIdx = 0; renderDict(); }

function renderDict() {
  const area = document.getElementById("area-dictionary");
  const prog = document.getElementById("prog-dictionary");
  prog.style.width = (dictIdx / DICTIONARY.length * 100) + "%";
  const item = DICTIONARY[dictIdx % DICTIONARY.length];

  if (dictMode === "learn") {
    area.innerHTML = `
      <div class="dict-card">
        <span class="dict-emoji">${item.e}</span>
        <span class="dict-category">${item.cat}</span>
        <span class="dict-uk">${item.uk}</span>
        <span class="dict-en">${item.en}</span>
      </div>
      <div class="letter-counter">${dictIdx % DICTIONARY.length + 1} / ${DICTIONARY.length}</div>
      <div class="letter-nav" style="margin-top:20px">
        ${dictIdx > 0 ? `<button class="nav-btn secondary" onclick="dictPrev()">← Назад</button>` : ""}
        <button class="nav-btn" onclick="dictNext()">${dictIdx < DICTIONARY.length-1 ? "Далі →" : "Спочатку ↺"}</button>
      </div>`;
  } else {
    // Quiz mode
    const opts = new Set([item.en]);
    while(opts.size < 4) {
      opts.add(DICTIONARY[Math.floor(Math.random()*DICTIONARY.length)].en);
    }
    dictQuizAnswer = item.en;
    area.innerHTML = `
      <div class="dict-card">
        <span class="dict-emoji">${item.e}</span>
        <span class="dict-uk">${item.uk}</span>
        <div style="margin-top:8px;color:rgba(255,255,255,.5);font-size:14px">Як це по-англійськи?</div>
      </div>
      <div class="dict-quiz-opts">
        ${shuffle([...opts]).map(o => `<button class="dict-opt" onclick="checkDictQuiz('${o}',this)">${o}</button>`).join("")}
      </div>
      <div class="letter-counter" style="margin-top:16px">${dictIdx % DICTIONARY.length + 1} / ${DICTIONARY.length}</div>`;
  }
}

window.checkDictQuiz = function(val, btn) {
  document.querySelectorAll(".dict-opt").forEach(b => b.disabled = true);
  if (val === dictQuizAnswer) {
    btn.classList.add("correct");
    addScore("dictionary", 2);
    setTimeout(() => { dictIdx++; renderDict(); }, 700);
  } else {
    btn.classList.add("wrong");
    document.querySelectorAll(".dict-opt").forEach(b => {
      if (b.textContent === dictQuizAnswer) b.classList.add("correct");
    });
    setTimeout(() => renderDict(), 1000);
  }
};

window.dictNext = function() { dictIdx = (dictIdx+1) % DICTIONARY.length; addScore("dictionary",1); renderDict(); };
window.dictPrev = function() { if(dictIdx>0){dictIdx--;renderDict();} };

// ══════════════════════════════════════
// 2048
// ══════════════════════════════════════
let board2048 = [];
let score2048 = 0;
let best2048  = parseInt(localStorage.getItem("best2048")||"0");

function init2048() {
  board2048 = Array(4).fill(null).map(()=>Array(4).fill(0));
  score2048 = 0;
  addRandom2048(); addRandom2048();
  render2048();
  setupSwipe2048();
}

function addRandom2048() {
  const empty = [];
  for(let r=0;r<4;r++) for(let c=0;c<4;c++) if(!board2048[r][c]) empty.push([r,c]);
  if(!empty.length) return;
  const [r,c] = empty[Math.floor(Math.random()*empty.length)];
  board2048[r][c] = Math.random()<.9 ? 2 : 4;
}

function render2048() {
  const area = document.getElementById("area-game2048");
  document.getElementById("score-game2048").textContent = score2048;
  if(score2048 > best2048) { best2048=score2048; localStorage.setItem("best2048",best2048); }
  area.innerHTML = `
    <div class="game2048-wrap">
      <div class="game2048-info">
        <span class="game2048-best">Рекорд: ${best2048}</span>
        <button class="game2048-new" onclick="init2048()">Нова гра</button>
      </div>
      <div class="board-2048" id="board2048">
        ${board2048.flat().map(v => `<div class="cell-2048-wrap ${v?'c'+v:''}">${v||""}</div>`).join("")}
      </div>
      <div style="color:rgba(255,255,255,.4);font-size:12px;text-align:center;margin-top:12px">
        Свайп або клавіші ← ↑ → ↓
      </div>
    </div>`;
}

function move2048(dir) {
  let moved = false;
  const b = board2048;
  const rotate = m => m[0].map((_,i)=>m.map(r=>r[i]).reverse());

  function slideRow(row) {
    let r = row.filter(x=>x);
    for(let i=0;i<r.length-1;i++) {
      if(r[i]===r[i+1]){ r[i]*=2; score2048+=r[i]; r.splice(i+1,1); }
    }
    while(r.length<4) r.push(0);
    return r;
  }

  let rotated = b;
  const times = {left:0,right:2,up:3,down:1};
  for(let i=0;i<times[dir];i++) rotated=rotate(rotated);
  const newB = rotated.map(row=>{
    const slid=slideRow([...row]);
    if(slid.join()!==row.join()) moved=true;
    return slid;
  });
  let result=newB;
  const back=4-times[dir];
  for(let i=0;i<back;i++) result=rotate(result);
  board2048=result;
  if(moved){addRandom2048(); render2048();}
  if(isGameOver2048()) {
    setTimeout(()=>showResult("🎮","Гра закінчена!",`Рахунок: ${score2048}`,score2048>=2048?3:score2048>=512?2:1),300);
  }
}

function isGameOver2048(){
  for(let r=0;r<4;r++) for(let c=0;c<4;c++){
    if(!board2048[r][c]) return false;
    if(c<3&&board2048[r][c]===board2048[r][c+1]) return false;
    if(r<3&&board2048[r][c]===board2048[r+1][c]) return false;
  }
  return true;
}

function setupSwipe2048(){
  let sx,sy;
  document.addEventListener("keydown", e=>{
    if(!document.getElementById("game-game2048").classList.contains("active")) return;
    const map={ArrowLeft:"left",ArrowRight:"right",ArrowUp:"up",ArrowDown:"down"};
    if(map[e.key]){e.preventDefault();move2048(map[e.key]);}
  },{passive:false});

  const board = document.getElementById("board2048");
  if(!board) return;
  board.addEventListener("touchstart",e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:true});
  board.addEventListener("touchend",e=>{
    const dx=e.changedTouches[0].clientX-sx;
    const dy=e.changedTouches[0].clientY-sy;
    if(Math.abs(dx)>Math.abs(dy)){move2048(dx>0?"right":"left");}
    else{move2048(dy>0?"down":"up");}
  },{passive:true});
}

// ── ОНОВЛЕНИЙ initGame ──
const _origInitGame = window.initGame || function(){};
window.initGame = function(gameId) {
  switch(gameId) {
    case "alphabet-uk":  initAlphabet("uk"); break;
    case "alphabet-en":  initAlphabet("en"); break;
    case "numbers":      initNumbers(); break;
    case "math":         initMath("add"); break;
    case "memory":       initMemory(); break;
    case "sentences":    initSentences(); break;
    case "tales":        initTales(); break;
    case "dictionary":   initDictionary(); break;
    case "game2048":     init2048(); break;
    case "achievements": renderAchievements(); break;
  }
};
