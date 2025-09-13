// ==========================
// 🟢 Initialization
// ==========================
if (localStorage.getItem("lives") === null) {
  localStorage.setItem("lives", "3");
}
let lives = parseInt(localStorage.getItem("lives"));
let xp = parseInt(localStorage.getItem("xp")) || 0;
let level = parseInt(localStorage.getItem("level")) || 1;

// ==========================
// 🛠️ Utility Functions
// ==========================
function requiredXP(lvl) {
  if (lvl <= 1) return 0;
  return 100 * ((lvl - 1) * lvl) / 2;
}
function showXPFeedback(amount) {
  const xpFeedback = document.getElementById("xp-feedback");
  if (!xpFeedback) return;
  xpFeedback.textContent = `+${amount} XP!`;
  xpFeedback.style.display = "block";
  setTimeout(() => xpFeedback.style.display = "none", 1500);
}
function renderLives() {
  const container = document.getElementById("life-container");
  if (!container) return;
  container.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const pen = document.createElement("span");
    pen.textContent = "✏️";
    pen.classList.add("pen");
    if (i >= lives) pen.classList.add("lost");
    container.appendChild(pen);
  }
}
function loseLife() {
  if (lives > 0) {
    lives--;
    localStorage.setItem("lives", lives);
    renderLives();
  }
  if (lives <= 0) {
    setTimeout(() => {
      alert("Game Over! Keine Leben mehr ✏️");
      localStorage.setItem("lives", "3");
      window.location.href = "../0_Homepage_Basic/index.html";
    }, 300);
  }
}
function updateXPDisplay() {
  const display = document.getElementById("xp-level-display");
  const progressBar = document.getElementById("xp-progress-bar");
  const currentLevelXP = requiredXP(level);
  const nextLevelXP = requiredXP(level + 1);
  const xpInLevel = xp - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const progressPercent = Math.min((xpInLevel / xpNeeded) * 100, 100);
  if (display) display.textContent = `Level: ${level} | XP: ${xpInLevel} / ${xpNeeded}`;
  if (progressBar) progressBar.style.width = `${progressPercent}%`;
}
function showHedgehogCelebration() {
  const hedgehog = document.getElementById("hedgehog-celebration");
  if (!hedgehog) return;
  hedgehog.style.bottom = "30px";
  setTimeout(() => hedgehog.style.bottom = "-200px", 3000);
}
function awardXP(amount) {
  xp += amount;
  let leveledUp = false;
  showXPFeedback(amount);
  while (xp >= requiredXP(level + 1)) {
    level++;
    leveledUp = true;
  }
  localStorage.setItem("xp", xp);
  localStorage.setItem("level", level);
  if (leveledUp) {
    alert(`Herzlichen Glückwunsch! Du hast Level ${level} erreicht! 🎉`);
    showHedgehogCelebration();
  }
  updateXPDisplay();
}

// ==========================
// ✅ Multiple Choice Logic (generalized)
// ==========================
function getCorrectAnswer() {
  const fromAttr =
    (document.body.getAttribute("data-correct-answer") ||
     document.documentElement.getAttribute("data-correct-answer") ||
     "").trim().toLowerCase();
  return fromAttr || "dorisch";
}
function checkAnswer(answer, btn) {
  const correctAnswer = getCorrectAnswer();
  const buttons = document.querySelectorAll(".options button");
  buttons.forEach(b => b.disabled = true);

  if ((answer || "").toLowerCase() === correctAnswer) {
    btn.classList.add("button-green");
    awardXP(10);
  } else {
    btn.classList.add("button-red");
    buttons.forEach(b => {
      if ((b.textContent || "").trim().toLowerCase() === correctAnswer) {
        b.classList.add("button-green");
      }
    });
    loseLife();
  }
  const nextBtn = document.getElementById("nextQuestionBtn");
  if (nextBtn) nextBtn.disabled = false;
}

// ==========================
// 📚 Question Navigation
// ==========================
const QUIZ_ID = "antike";
const ORDER_KEY = `${QUIZ_ID}:order`;
const INDEX_KEY = `${QUIZ_ID}:index`;

const RAW_QUESTIONS = [
  "../1.1.1_quest_antike_nr1/index.html",
  "../1.1.2_quest_antike_nr2/index.html",
  "../1.1.3_quest_antike_nr3/index.html",
  "../1.1.4_quest_antike_nr4/index.html",
  "../1.1.5_quest_antike_nr5/index.html",
  "../1.1.6_quest_antike_nr6/index.html",
  "../1.1.7_quest_antike_nr7/index.html",
  "../1.1.8_quest_antike_nr8/index.html",
  "../1.1.9_quest_antike_nr9/index.html",
  "../1.1.10_quest_antike_nr10/index.html"
];

function getScriptBase() {
  const thisScript = [...document.scripts].find(s => s.src && s.src.endsWith("script.js"));
  return new URL(".", thisScript ? thisScript.src : document.location.href);
}
const SCRIPT_BASE = getScriptBase();
function toAbsolute(path) { return new URL(path, SCRIPT_BASE).href; }
function normalizeUrl(href) {
  const u = new URL(href, SCRIPT_BASE);
  u.hash = ""; u.search = "";
  let path = u.pathname.replace(/\/index\.html$/, "/");
  if (!path.endsWith("/")) path += "/";
  return u.origin + path;
}
function shuffleArray(a){ for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} }
function buildOrder() {
  const abs = RAW_QUESTIONS.map(toAbsolute);
  const order = abs.slice();
  shuffleArray(order);
  localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  localStorage.setItem(INDEX_KEY, "0");
  return order;
}
function getOrder() {
  const saved = JSON.parse(localStorage.getItem(ORDER_KEY));
  if (Array.isArray(saved) && saved.length === RAW_QUESTIONS.length) return saved;
  return buildOrder();
}
function getIndex() {
  const v = parseInt(localStorage.getItem(INDEX_KEY), 10);
  return Number.isFinite(v) ? v : 0;
}
function setIndex(idx) { localStorage.setItem(INDEX_KEY, String(idx)); }
function clearQuizProgress() {
  localStorage.removeItem(ORDER_KEY);
  localStorage.removeItem(INDEX_KEY);
}

window.addEventListener("load", () => {
  const order = getOrder();
  const here = normalizeUrl(location.href);
  const hasState = localStorage.getItem(INDEX_KEY) !== null;
  const first = normalizeUrl(order[0]);

  if (!hasState) {
    if (here !== first) { location.replace(order[0]); return; }
    setIndex(0); return;
  }

  const i = getIndex();
  const expected = normalizeUrl(order[i]);
  if (here !== expected) { location.replace(order[i]); return; }
  setIndex(i);
});

const nextBtn = document.getElementById("nextQuestionBtn");
if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    nextBtn.disabled = true;
    const order = getOrder();
    let i = getIndex() + 1;
    if (i >= order.length) {
      alert("Quiz beendet! Sie haben alle Fragen beantwortet.");
      clearQuizProgress();
      window.location.href = "../0_Homepage_Basic/index.html";
      return;
    }
    setIndex(i);
    window.location.href = order[i];
  });
}

// ==========================
// 🚀 Initial UI Render
// ==========================
renderLives();
updateXPDisplay();
