function goToAntike() {
  // These paths are relative to 1.1_Auswahl_Bauepochen/
  const antikeQuestions = [
    "../1.1.1_quest_antike_nr1/index.html",
    "../1.1.2_quest_antike_nr2/index.html"
  ];

  // Pick random one
  const randomIndex = Math.floor(Math.random() * antikeQuestions.length);
  window.location.href = antikeQuestions[randomIndex];
}