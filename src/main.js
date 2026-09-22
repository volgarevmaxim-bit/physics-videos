import { loadIndex, isUnlocked, buildEmbedUrl } from './scheduler.js';
import { renderQuestions } from './quiz.js';

let videos = [];
let unlockedIndices = [];

const playerEl = document.getElementById('player');
const selectEl = document.getElementById('videoSelect');
const listEl = document.getElementById('videoList');
const questionsEl = document.getElementById('questionsPanel');

function playVideo(index) {
  if (!isUnlocked(unlockedIndices, index)) return;
  const v = videos[index];
  playerEl.src = buildEmbedUrl(v);
  selectEl.value = index;
  document.querySelectorAll('.video-item').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });
  renderQuestions(questionsEl, v);
}

function render() {
  selectEl.innerHTML = '';
  listEl.innerHTML = '';

  videos.forEach((v, i) => {
    const unlocked = isUnlocked(unlockedIndices, i);

    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = unlocked ? v.title : `🔒 ${v.title}`;
    opt.disabled = !unlocked;
    selectEl.appendChild(opt);

    const item = document.createElement('div');
    item.className = 'video-item' + (unlocked ? '' : ' locked');
    item.textContent = unlocked ? v.title : `🔒 ${v.title}`;
    if (unlocked) {
      item.addEventListener('click', () => playVideo(i));
    }
    listEl.appendChild(item);
  });

  const defaultIndex = unlockedIndices.length
    ? unlockedIndices[unlockedIndices.length - 1]
    : 0;
  if (unlockedIndices.length) {
    playVideo(defaultIndex);
  } else {
    questionsEl.innerHTML = '<div class="lock-note">Новое видео появится совсем скоро 🙂</div>';
  }
}

selectEl.addEventListener('change', () => playVideo(Number(selectEl.value)));

loadIndex().then((result) => {
  videos = result.videos;
  unlockedIndices = result.unlockedIndices;
  render();
});