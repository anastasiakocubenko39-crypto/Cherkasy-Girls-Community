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
