export function renderQuestions(container, v) {
  if (!v || !v.questions || v.questions.length === 0) {
    container.innerHTML = '';
    return;
  }
  const items = v.questions.map(q => `<li>${q}</li>`).join('');
  container.innerHTML = `<h2>Подумай и обсуди:</h2><ol>${items}</ol>`;
}
