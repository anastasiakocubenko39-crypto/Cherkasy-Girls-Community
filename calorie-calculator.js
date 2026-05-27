// ── КАЛЬКУЛЯТОР БЖУ ──
const NUTRITION_DB = {
  // М'ясо
  "куряче філе":{p:31,f:3.6,c:0,cal:165},"куряча грудка":{p:31,f:3.6,c:0,cal:165},
  "яловичина":{p:26,f:16,c:0,cal:250},"свинина":{p:20,f:30,c:0,cal:350},
  "індичка":{p:28,f:3.6,c:0,cal:150},"курка":{p:25,f:7.4,c:0,cal:165},
  // Риба
  "лосось":{p:20,f:13,c:0,cal:200},"тунець":{p:29,f:1,c:0,cal:130},
  "тріска":{p:17,f:0.6,c:0,cal:82},"оселедець":{p:17,f:19,c:0,cal:250},
  // Яйця та молочні
  "яйце":{p:13,f:11,c:1.1,cal:155},"яйця":{p:13,f:11,c:1.1,cal:155},
  "молоко":{p:3.2,f:3.5,c:4.7,cal:64},"молоко 2.5%":{p:2.8,f:2.5,c:4.7,cal:54},
  "творог":{p:18,f:9,c:3,cal:160},"творог 5%":{p:17,f:5,c:2.8,cal:121},
  "кефір":{p:3.4,f:2.5,c:4,cal:56},"сметана":{p:2.5,f:20,c:3.4,cal:210},
  "сир твердий":{p:26,f:30,c:0,cal:380},"масло":{p:0.8,f:82,c:0.7,cal:748},
  // Крупи
  "гречка":{p:12.6,f:3.3,c:62,cal:330},"рис":{p:6.7,f:0.7,c:78,cal:344},
  "вівсянка":{p:11,f:6.1,c:65,cal:367},"перловка":{p:9.3,f:1.1,c:73,cal:324},
  "пшоно":{p:11.5,f:3.3,c:66,cal:342},"булгур":{p:12.3,f:1.3,c:65,cal:342},
  "кіноа":{p:14.1,f:6.1,c:64,cal:368},"кус-кус":{p:12.8,f:0.6,c:72,cal:344},
  // Макарони та хліб
  "макарони":{p:10.4,f:1.1,c:69,cal:337},"спагеті":{p:12.5,f:1.8,c:70,cal:349},
  "хліб білий":{p:7.7,f:2.4,c:53,cal:265},"хліб чорний":{p:6.6,f:1.2,c:40,cal:201},
  "батон":{p:7.5,f:2.9,c:51,cal:260},
  // Овочі
  "картопля":{p:2,f:0.1,c:17,cal:77},"морква":{p:1.3,f:0.1,c:6.9,cal:35},
  "помідор":{p:0.9,f:0.2,c:3.7,cal:20},"огірок":{p:0.8,f:0.1,c:2.8,cal:15},
  "капуста":{p:1.8,f:0.1,c:4.7,cal:27},"броколі":{p:2.8,f:0.4,c:6.6,cal:34},
  "цибуля":{p:1.4,f:0.2,c:8.2,cal:41},"часник":{p:6.4,f:0.5,c:30,cal:149},
  "шпинат":{p:2.9,f:0.4,c:2,cal:23},"авокадо":{p:2,f:15,c:0.9,cal:160},
  "перець червоний":{p:1,f:0.3,c:6,cal:31},"баклажан":{p:1.2,f:0.1,c:4.5,cal:25},
  "кабачок":{p:0.6,f:0.3,c:4.6,cal:24},"гарбуз":{p:1.3,f:0.3,c:7.7,cal:28},
  "буряк":{p:1.5,f:0.1,c:8.8,cal:43},"гриби":{p:3.2,f:0.5,c:3.4,cal:22},
  // Фрукти
  "яблуко":{p:0.4,f:0.4,c:10,cal:52},"банан":{p:1.5,f:0.2,c:21,cal:96},
  "апельсин":{p:0.9,f:0.2,c:8.1,cal:43},"виноград":{p:0.6,f:0.2,c:16.8,cal:72},
  "полуниця":{p:0.8,f:0.4,c:7.5,cal:33},"груша":{p:0.4,f:0.3,c:9.5,cal:42},
  "персик":{p:0.9,f:0.1,c:9.5,cal:46},"кавун":{p:0.6,f:0.1,c:5.8,cal:30},
  "лимон":{p:0.9,f:0.1,c:3,cal:17},
  // Горіхи та олії
  "волоський горіх":{p:15.2,f:65,c:13.7,cal:654},"мигдаль":{p:21,f:53,c:13,cal:575},
  "арахіс":{p:26,f:45,c:9.9,cal:567},"насіння соняшника":{p:20,f:52,c:10.5,cal:584},
  "оливкова олія":{p:0,f:99.8,c:0,cal:898},"соняшникова олія":{p:0,f:99.9,c:0,cal:899},
  // Бобові
  "квасоля":{p:21,f:2,c:47,cal:290},"нут":{p:19,f:6,c:61,cal:364},
  "сочевиця":{p:25,f:1.1,c:60,cal:353},"горох":{p:23,f:1.6,c:57,cal:339},
  // Цукор та солодке
  "цукор":{p:0,f:0,c:99.8,cal:387},"мед":{p:0.8,f:0,c:80,cal:329},
  "шоколад чорний":{p:7.8,f:34,c:43,cal:511},
};

function initCalcUI(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div class="calc-wrap">
      <h3 class="calc-title">Калькулятор БЖУ</h3>
      <p class="calc-sub">Введіть продукт і кількість грамів</p>
      <div class="calc-row">
        <div class="calc-input-wrap">
          <input id="calcProduct" class="calc-input" placeholder="Назва продукту (укр)" list="calcList" autocomplete="off" oninput="calcSuggest()">
          <datalist id="calcList">
            ${Object.keys(NUTRITION_DB).map(k=>`<option value="${k}">`).join("")}
          </datalist>
        </div>
        <input id="calcAmount" class="calc-amount" type="number" placeholder="г" value="100" min="1" max="9999">
        <button class="calc-btn" onclick="calcBJU()">Рахувати</button>
      </div>
      <div id="calcResult" class="calc-result hidden"></div>
      <div id="calcHistory" class="calc-history"></div>
    </div>`;
}

window.calcBJU = function() {
  const name   = document.getElementById("calcProduct").value.trim().toLowerCase();
  const amount = parseFloat(document.getElementById("calcAmount").value) || 100;
  const result = document.getElementById("calcResult");

  const item = NUTRITION_DB[name];
  if (!item) {
    result.className = "calc-result error";
    result.innerHTML = `<span>❌ Продукт не знайдено. Спробуйте: <b>${Object.keys(NUTRITION_DB).slice(0,5).join(", ")}</b>...</span>`;
    return;
  }

  const k = amount / 100;
  const p = (item.p * k).toFixed(1);
  const f = (item.f * k).toFixed(1);
  const c = (item.c * k).toFixed(1);
  const cal = Math.round(item.cal * k);

  result.className = "calc-result show";
  result.innerHTML = `
    <div class="calc-product-name">${name.charAt(0).toUpperCase()+name.slice(1)} · ${amount}г</div>
    <div class="calc-macros">
      <div class="macro-card prot"><div class="macro-val">${p}г</div><div class="macro-lbl">Білки</div></div>
      <div class="macro-card fat"><div class="macro-val">${f}г</div><div class="macro-lbl">Жири</div></div>
      <div class="macro-card carb"><div class="macro-val">${c}г</div><div class="macro-lbl">Вуглеводи</div></div>
      <div class="macro-card kcal"><div class="macro-val">${cal}</div><div class="macro-lbl">ккал</div></div>
    </div>`;

  // Add to history
  const hist = document.getElementById("calcHistory");
  const row = document.createElement("div");
  row.className = "hist-row";
  row.innerHTML = `<span>${name.charAt(0).toUpperCase()+name.slice(1)} ${amount}г</span><span>Б:${p} Ж:${f} В:${c} <b>${cal} ккал</b></span>`;
  hist.insertBefore(row, hist.firstChild);
  if (hist.children.length > 5) hist.removeChild(hist.lastChild);
};

window.calcSuggest = function() {};
