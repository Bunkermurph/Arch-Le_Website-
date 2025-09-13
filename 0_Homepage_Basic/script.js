window.addEventListener('DOMContentLoaded', () => {
  const levelDisplay = document.getElementById('user-level');
  if (!levelDisplay) {
    console.error("❌ Element #user-level not found");
    return;
  }

  let level = parseInt(localStorage.getItem('level'), 10);
  if (isNaN(level) || level < 1) {
    level = 1;
    localStorage.setItem('level', level);
  }

  levelDisplay.textContent = `Level: ${level}`;
});

// Optional: Call this from other pages to update level
function updateUserLevel(newLevel) {
  const level = parseInt(newLevel, 10);
  if (!isNaN(level) && level > 0) {
    localStorage.setItem('level', level);
  }
}
