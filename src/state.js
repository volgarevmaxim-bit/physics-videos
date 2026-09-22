const STORAGE_KEY = 'physicsVideosProgress';
const PROFILE_KEY = 'currentProfileId';

function nowISO() {
  return new Date().toISOString();
}

/**
 * Load progress from localStorage. Returns { profiles: {} } on miss or corruption.
 */
export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.profiles) {
        return parsed;
      }
    }
  } catch (e) {
    // corrupt data — reset
  }
  return { profiles: {} };
}

/**
 * Serialise and write progress to localStorage.
 */
export function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

/**
 * Ensure a profile entry exists and return it.
 */
export function getProfileProgress(progress, profileId) {
  if (!progress.profiles[profileId]) {
    progress.profiles[profileId] = { watched: {} };
  }
  return progress.profiles[profileId];
}

/**
 * Increment viewCount and update lastWatchedAt.
 * Creates the entry if it doesn't exist.
 */
export function recordView(progress, profileId, videoId) {
  const prof = getProfileProgress(progress, profileId);
  if (!prof.watched[videoId]) {
    prof.watched[videoId] = {};
  }
  const entry = prof.watched[videoId];
  entry.viewCount = (entry.viewCount || 0) + 1;
  entry.lastWatchedAt = nowISO();
  return progress;
}

/**
 * Mark a video as completed (does NOT reset viewCount).
 */
export function markCompleted(progress, profileId, videoId) {
  const prof = getProfileProgress(progress, profileId);
  if (!prof.watched[videoId]) {
    prof.watched[videoId] = {};
  }
  const entry = prof.watched[videoId];
  entry.completed = true;
  entry.lastWatchedAt = nowISO();
  return progress;
}

/**
 * Get / set the active profile id (persisted to localStorage).
 */
export function getCurrentProfileId() {
  return localStorage.getItem(PROFILE_KEY);
}

export function setCurrentProfileId(id) {
  localStorage.setItem(PROFILE_KEY, id);
}

/**
 * Pure function: apply seed videos if the profile hasn't been seeded
 * with this seedVersion yet. Does NOT call saveProgress.
 *
 * @param {object} progress
 * @param {string} profileId
 * @param {string[]} videoIds
 * @param {number} seedVersion
 * @param {string} seedDate - ISO date string
 * @returns {object} updated progress
 */
export function applySeed(progress, profileId, videoIds, seedVersion, seedDate) {
  const prof = getProfileProgress(progress, profileId);
  if (prof.seeded >= seedVersion) {
    return progress; // already seeded with this or newer version
  }
  for (const videoId of videoIds) {
    prof.watched[videoId] = {
      completed: true,
      viewCount: 1,
      lastWatchedAt: seedDate,
      rating: null,
    };
  }
  prof.seeded = seedVersion;
  return progress;
}

/**
 * Check if a specific video is completed for a profile.
 */
export function isCompleted(progress, profileId, videoId) {
  const prof = progress.profiles[profileId];
  if (!prof || !prof.watched) return false;
  const entry = prof.watched[videoId];
  return entry ? !!entry.completed : false;
}

/**
 * Check whether the profile has at least one unlocked + unwatched video.
 */
export function hasUnwatched(videos, unlockedIndices, progress, profileId) {
  const prof = progress.profiles[profileId];
  const watched = (prof && prof.watched) || {};
  return unlockedIndices.some(i => {
    const v = videos[i];
    return v && !(watched[v.id] && watched[v.id].completed);
  });
}

/**
 * Choose the next video to play:
 * - If there are unlocked unwatched videos → last one in unlockedIndices order
 * - If all unlocked are watched → first unlocked (repeat), flagged isRepeat: true
 * - If nothing unlocked → null
 */
export function pickNextVideo(videos, unlockedIndices, progress, profileId) {
  if (!unlockedIndices || unlockedIndices.length === 0) return null;

  const prof = progress.profiles[profileId];
  const watched = (prof && prof.watched) || {};

  const unwatched = unlockedIndices.filter(i => {
    const v = videos[i];
    return v && !(watched[v.id] && watched[v.id].completed);
  });

  if (unwatched.length > 0) {
    return { index: unwatched[unwatched.length - 1], isRepeat: false };
  }

  // All unlocked watched → repeat first unlocked
  return { index: unlockedIndices[0], isRepeat: true };
}