import { loadIndex, isUnlocked, buildEmbedUrl } from './scheduler.js';
import { renderQuestions } from './quiz.js';
import {
  loadProgress, saveProgress, getProfileProgress,
  recordView, markCompleted, isCompleted,
  getCurrentProfileId, setCurrentProfileId, pickNextVideo, applySeed,
} from './state.js';
import { SEED_VERSION, SEED_VIDEOS, SEED_DATE } from './seed.js';

let videos = [];
let unlockedIndices = [];
let profilesData = [];
let currentProgress = {};
let currentProfileId = null;

// Watcher state
let watcherTimer = null;
let watcherAccumulated = 0;
let watcherDuration = 0;
let watcherTargetIndex = -1; // which video the watcher is tracking

const playerEl = document.getElementById('player');
const selectEl = document.getElementById('videoSelect');
const listEl = document.getElementById('videoList');
const questionsEl = document.getElementById('questionsPanel');
const profileGateEl = document.getElementById('profileGate');
const profileCardsEl = document.getElementById('profileCards');
const switchProfileBtnEl = document.getElementById('switchProfileBtn');

// ---------- Watcher ----------

function clearWatcher() {
  if (watcherTimer) {
    clearInterval(watcherTimer);
    watcherTimer = null;
  }
  watcherAccumulated = 0;
  watcherTargetIndex = -1;
}

function startWatcher(index) {
  clearWatcher();
  const v = videos[index];
  if (!v) return;

  // Don't track already-completed videos
  if (isCompleted(currentProgress, currentProfileId, v.id)) return;

  watcherTargetIndex = index;
  watcherDuration = v.duration;
  watcherAccumulated = 0;

  watcherTimer = setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    watcherAccumulated++;
    if (watcherAccumulated >= watcherDuration * 0.9) {
      clearWatcher();
      markCompleted(currentProgress, currentProfileId, v.id);
      saveProgress(currentProgress);
      renderVideoItems(); // refresh "уже смотрели" markers
    }
  }, 1000);
}

// ---------- Rendering ----------

function renderVideoItems() {
  listEl.innerHTML = '';

  videos.forEach((v, i) => {
    const unlocked = isUnlocked(unlockedIndices, i);
    const completed = isCompleted(currentProgress, currentProfileId, v.id);

    const item = document.createElement('div');
    let cls = 'video-item';
    if (!unlocked) cls += ' locked';
    if (unlocked && completed) cls += ' rewatch';
    item.className = cls;

    let text = unlocked ? v.title : `🔒 ${v.title}`;
    if (unlocked && completed) text += ' · уже смотрели';
    item.textContent = text;

    if (unlocked) {
      item.addEventListener('click', () => playVideo(i));
    }
    listEl.appendChild(item);
  });

  // Keep select in sync
  selectEl.innerHTML = '';
  videos.forEach((v, i) => {
    const unlocked = isUnlocked(unlockedIndices, i);
    const completed = isCompleted(currentProgress, currentProfileId, v.id);
    const opt = document.createElement('option');
    opt.value = i;
    let text = unlocked ? v.title : `🔒 ${v.title}`;
    if (unlocked && completed) text += ' · уже смотрели';
    opt.textContent = text;
    opt.disabled = !unlocked;
    selectEl.appendChild(opt);
  });
}

function playVideo(index) {
  if (!isUnlocked(unlockedIndices, index)) return;

  clearWatcher();
  const v = videos[index];

  playerEl.src = buildEmbedUrl(v);
  selectEl.value = index;
  document.querySelectorAll('.video-item').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });
  renderQuestions(questionsEl, v);

  // Record view & persist
  recordView(currentProgress, currentProfileId, v.id);
  saveProgress(currentProgress);

  // Start completion-tracking timer (ignores already-completed videos)
  startWatcher(index);
}

function render() {
  renderVideoItems();

  const next = pickNextVideo(videos, unlockedIndices, currentProgress, currentProfileId);
  if (next) {
    playVideo(next.index);
  } else {
    questionsEl.innerHTML = '<div class="lock-note">Новое видео появится совсем скоро 🙂</div>';
  }
}

selectEl.addEventListener('change', () => playVideo(Number(selectEl.value)));
switchProfileBtnEl.addEventListener('click', () => showProfileGate());

// ---------- Profile gate ----------

function showProfileGate() {
  clearWatcher();
  profileGateEl.classList.add('visible');
  switchProfileBtnEl.style.display = 'none';
}

function hideProfileGate() {
  profileGateEl.classList.remove('visible');
  switchProfileBtnEl.style.display = 'block';
}

async function selectProfile(id) {
  setCurrentProfileId(id);
  currentProfileId = id;
  hideProfileGate();
  await initApp();
}

async function initApp() {
  currentProgress = loadProgress();

  // Apply seeds (safe to call every start — applySeed checks the marker)
  applySeed(currentProgress, 'son', SEED_VIDEOS, SEED_VERSION, SEED_DATE);
  saveProgress(currentProgress);

  const result = await loadIndex();
  videos = result.videos;
  unlockedIndices = result.unlockedIndices;
  render();
}

// ---------- Startup ----------

async function startUp() {
  try {
    const resp = await fetch('data/profiles.json');
    const data = await resp.json();
    profilesData = data.profiles || [];
  } catch (e) {
    profilesData = [{ id: 'me', name: 'Я' }, { id: 'son', name: 'Сын' }];
  }

  // Populate gate cards
  profileCardsEl.innerHTML = '';
  for (const p of profilesData) {
    const card = document.createElement('div');
    card.className = 'profile-card';
    card.textContent = p.name;
    card.addEventListener('click', () => selectProfile(p.id));
    profileCardsEl.appendChild(card);
  }

  // Check if a profile was already selected
  const savedId = getCurrentProfileId();
  if (savedId && profilesData.some(p => p.id === savedId)) {
    currentProfileId = savedId;
    hideProfileGate();
    await initApp();
  } else {
    showProfileGate();
  }
}

startUp().catch(e => {
  console.error('Startup error:', e);
  // Fallback: show gate
  showProfileGate();
});