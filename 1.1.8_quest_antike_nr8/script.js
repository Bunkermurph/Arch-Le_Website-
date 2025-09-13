// ==========================
// Init
// ==========================
if (localStorage.getItem("lives") === null) localStorage.setItem("lives","3");
let lives = parseInt(localStorage.getItem("lives"));
let xp = parseInt(localStorage.getItem("xp")) || 0;
let level = parseInt(localStorage.getItem("level")) || 1;

// ==========================
// Utilities
// ==========================
function requiredXP(lvl){ if(lvl<=1) return 0; return 100*((lvl-1)*lvl)/2; }
function showXPFeedback(amount){
  const el=document.getElementById("xp-feedback"); if(!el) return;
  el.textContent = `+${amount} XP!`; el.style.display="block";
  setTimeout(()=> el.style.display="none",1500);
}
function renderLives(){
  const c=document.getElementById("life-container"); if(!c) return;
  c.innerHTML="";
  for(let i=0;i<3;i++){
    const s=document.createElement("span");
    s.textContent="✏️"; s.classList.add("pen"); if(i>=lives) s.classList.add("lost");
    c.appendChild(s);
  }
}
function loseLife(){
  if(lives>0){ lives--; localStorage.setItem("lives", lives); renderLives(); }
  if(lives<=0){
    setTimeout(()=>{
      alert("Game Over! Keine Leben mehr ✏️");
      localStorage.setItem("lives","3");
      window.location.href="../0_Homepage_Basic/index.html";
    },300);
  }
}
function updateXPDisplay(){
  const d=document.getElementById("xp-level-display");
  const bar=document.getElementById("xp-progress-bar");
  const cur=requiredXP(level), next=requiredXP(level+1);
  const inLvl = xp - cur, need = next - cur;
  const pct = Math.min((inLvl/need)*100, 100);
  if(d) d.textContent = `Level: ${level} | XP: ${inLvl} / ${need}`;
  if(bar) bar.style.width = `${pct}%`;
}
function showHedgehogCelebration(){
  const h=document.getElementById("hedgehog-celebration"); if(!h) return;
  h.style.bottom="30px"; setTimeout(()=> h.style.bottom="-200px",3000);
}
function awardXP(amount){
  xp += amount; let up=false; showXPFeedback(amount);
  while(xp >= requiredXP(level+1)){ level++; up=true; }
  localStorage.setItem("xp", xp); localStorage.setItem("level", level);
  if(up){ alert(`Herzlichen Glückwunsch! Du hast Level ${level} erreicht! 🎉`); showHedgehogCelebration(); }
  updateXPDisplay();
}

// ==========================
// Multiple Choice helper (kept for other pages)
// ==========================
function getCorrectAnswer(){
  const a=(document.body.getAttribute("data-correct-answer")||
           document.documentElement.getAttribute("data-correct-answer")||"").trim().toLowerCase();
  return a || "dorisch";
}
function checkAnswer(answer, btn){
  const correct=getCorrectAnswer();
  const buttons=document.querySelectorAll(".options button");
  buttons.forEach(b=>b.disabled=true);
  if((answer||"").toLowerCase()===correct){ btn.classList.add("button-green"); awardXP(10); }
  else{
    btn.classList.add("button-red");
    buttons.forEach(b=>{ if((b.textContent||"").trim().toLowerCase()===correct) b.classList.add("button-green"); });
    loseLife();
  }
  const nextBtn=document.getElementById("nextQuestionBtn"); if(nextBtn) nextBtn.disabled=false;
}

// ==========================
// Frage-8: Fill-in handler
// ==========================
window.addEventListener("DOMContentLoaded", ()=>{
  const input = document.getElementById("blankInput");
  const checkBtn = document.getElementById("checkBlankBtn");
  if (checkBtn){
    const CORRECT = "5"; // 5. Jh. v. Chr.
    checkBtn.addEventListener("click", ()=>{
      checkBtn.disabled = true;
      if (input) input.disabled = true;

      const val = (input?.value || "").trim().replace(/[^\d]/g,"");
      if (val === CORRECT){
        input?.classList.add("correct-border");
        awardXP(10);
      } else {
        input?.classList.add("wrong-border");
        loseLife();
      }
      const nextBtn=document.getElementById("nextQuestionBtn"); if(nextBtn) nextBtn.disabled=false;
    });
  }
});

// ==========================
// Navigation
// ==========================
const QUIZ_ID="antike", ORDER_KEY=`${QUIZ_ID}:order`, INDEX_KEY=`${QUIZ_ID}:index`;
const RAW_QUESTIONS=[
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
function getScriptBase(){ const s=[...document.scripts].find(x=>x.src&&x.src.endsWith("script.js")); return new URL(".", s ? s.src : document.location.href); }
const SCRIPT_BASE=getScriptBase();
function toAbsolute(p){ return new URL(p, SCRIPT_BASE).href; }
function normalizeUrl(h){ const u=new URL(h, SCRIPT_BASE); u.hash=""; u.search=""; let path=u.pathname.replace(/\/index\.html$/,"/"); if(!path.endsWith("/")) path+="/"; return u.origin+path; }
function shuffleArray(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } }
function buildOrder(){ const abs=RAW_QUESTIONS.map(toAbsolute); const order=abs.slice(); shuffleArray(order); localStorage.setItem(ORDER_KEY, JSON.stringify(order)); localStorage.setItem(INDEX_KEY,"0"); return order; }
function getOrder(){ const s=JSON.parse(localStorage.getItem(ORDER_KEY)); return (Array.isArray(s)&&s.length===RAW_QUESTIONS.length)?s:buildOrder(); }
function getIndex(){ const v=parseInt(localStorage.getItem(INDEX_KEY),10); return Number.isFinite(v)?v:0; }
function setIndex(i){ localStorage.setItem(INDEX_KEY, String(i)); }
function clearQuizProgress(){ localStorage.removeItem(ORDER_KEY); localStorage.removeItem(INDEX_KEY); }

window.addEventListener("load",()=>{
  const order=getOrder(); const here=normalizeUrl(location.href);
  const has=localStorage.getItem(INDEX_KEY)!==null; const first=normalizeUrl(order[0]);
  if(!has){ if(here!==first){ location.replace(order[0]); return; } setIndex(0); return; }
  const i=getIndex(); const expected=normalizeUrl(order[i]);
  if(here!==expected){ location.replace(order[i]); return; }
  setIndex(i);
});

const nextBtn=document.getElementById("nextQuestionBtn");
if(nextBtn){
  nextBtn.addEventListener("click",()=>{
    nextBtn.disabled=true;
    const order=getOrder(); let i=getIndex()+1;
    if(i>=order.length){
      alert("Quiz beendet! Sie haben alle Fragen beantwortet.");
      clearQuizProgress();
      window.location.href="../0_Homepage_Basic/index.html";
      return;
    }
    setIndex(i); window.location.href=order[i];
  });
}

// ==========================
// First render
// ==========================
renderLives();
updateXPDisplay();
