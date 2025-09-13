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
// 🧩 Drag & Drop Logic
// ==========================
const draggables = document.querySelectorAll(".draggable");
const dropzones = document.querySelectorAll(".dropzone");
let assignments = {}; // { dropzoneAnswer: draggedId }

draggables.forEach(drag => {
  drag.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", e.target.id);
    e.dataTransfer.effectAllowed = "copy";
  });
});

dropzones.forEach(zone => {
  zone.addEventListener("dragover", e => {
    e.preventDefault();
    zone.classList.add("over");
    e.dataTransfer.dropEffect = "copy";
  });

  zone.addEventListener("dragleave", () => {
    zone.classList.remove("over");
  });

  zone.addEventListener("drop", e => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    const draggedElement = document.getElementById(draggedId);

    const clone = draggedElement.cloneNode(true);
    clone.id = draggedId + "-clone-" + Date.now();
    clone.draggable = false;
    clone.style.cursor = "default";

    zone.innerHTML = "";
    zone.appendChild(clone);

    assignments[zone.dataset.answer] = draggedId;
    draggedElement.style.opacity = "0.5";

    zone.classList.remove("over");
  });
});

function checkResults() {
  if (Object.keys(assignments).length < dropzones.length) {
    alert("Bitte alle Bilder zuordnen, bevor du überprüfst!");
    return;
  }

  let anyWrong = false;

  dropzones.forEach(zone => {
    const correctId = zone.dataset.answer;
    const placedId = assignments[correctId];

    if (placedId === correctId) {
      zone.classList.add("correct");
      zone.classList.remove("wrong");
    } else {
      zone.classList.add("wrong");
      zone.classList.remove("correct");
      anyWrong = true;
    }
  });

  if (anyWrong) {
    loseLife();
  } else {
    awardXP(20); // ✅ XP only if all correct
  }

  // ✅ Enable Next button after checking results
  const nextBtn = document.getElementById("nextQuestionBtn");
  if (nextBtn) nextBtn.disabled = false;
}


// ==========================
// 📚 Question Navigation (robust & safe)
// ==========================

// 👉 Ein eigener Storage-Namespace pro Quiz (falls du mehrere Quizzes hast)
const QUIZ_ID = "antike";
const ORDER_KEY = `${QUIZ_ID}:order`;
const INDEX_KEY = `${QUIZ_ID}:index`;

// 1) Fragenliste (relative Pfade aus Sicht der JS-Datei)
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

// 2) Fester Basis-Pfad: Verankere die Auflösung an der JS-Datei, NICHT an der aktuellen Seite
function getScriptBase() {
  // nimmt das aktuell eingebundene script mit src=...script.js
  const thisScript = [...document.scripts].find(s => s.src && s.src.endsWith("script.js"));
  const base = new URL(".", thisScript ? thisScript.src : document.location.href);
  return base;
}

const SCRIPT_BASE = getScriptBase();

function toAbsolute(path) {
  return new URL(path, SCRIPT_BASE).href;
}

function normalizeUrl(href) {
  const u = new URL(href, SCRIPT_BASE);
  u.hash = "";
  u.search = "";
  // /index.html → /
  let path = u.pathname.replace(/\/index\.html$/, "/");
  if (!path.endsWith("/")) path += "/";
  return u.origin + path;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

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
  // nur akzeptieren, wenn Länge passt
  if (Array.isArray(saved) && saved.length === RAW_QUESTIONS.length) {
    return saved;
  }
  return buildOrder();
}

function getIndex() {
  const v = parseInt(localStorage.getItem(INDEX_KEY), 10);
  return Number.isFinite(v) ? v : 0;
}

function setIndex(idx) {
  localStorage.setItem(INDEX_KEY, String(idx));
}

function clearQuizProgress() {
  localStorage.removeItem(ORDER_KEY);
  localStorage.removeItem(INDEX_KEY);
}

// 3) Beim Laden: Start/Sync strenger handhaben (NEU)
window.addEventListener("load", () => {
  const order = getOrder();
  const here = normalizeUrl(location.href);

  const hasState = localStorage.getItem(INDEX_KEY) !== null;
  const first = normalizeUrl(order[0]);

  if (!hasState) {
    // Frischer Durchlauf: immer bei der ersten Frage starten
    if (here !== first) {
      location.replace(order[0]);
      return;
    }
    setIndex(0);
    return;
  }

  // Es gibt bereits Fortschritt → erwarte genau die Frage an Position getIndex()
  const i = getIndex();
  const expected = normalizeUrl(order[i]);

  if (here !== expected) {
    // Quer-Einstieg oder veralteter Tab → zur erwarteten Frage leiten
    location.replace(order[i]);
    return;
  }

  // Seite passt → Index beibehalten (nicht mit pos überschreiben)
  setIndex(i);
});

// 4) Next-Button: genau eine Frage weiter, danach Ende
const nextBtn = document.getElementById("nextQuestionBtn");
if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    // Doppelklick-Schutz
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
