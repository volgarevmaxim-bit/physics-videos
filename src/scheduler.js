export async function loadIndex() {
  const [videosData, availableData] = await Promise.all([
    fetch('data/videos.json').then(r => r.json()),
    fetch('data/available.json').then(r => r.json()).catch(() => null)
  ]);

  let unlockedIndices;
  if (availableData && Array.isArray(availableData.unlockedIndices)) {
    unlockedIndices = availableData.unlockedIndices;
  } else {
    // Резервный вариант, если available.json недоступен: открыто только первое видео.
    unlockedIndices = [0];
  }

  return { videos: videosData, unlockedIndices };
}

export function isUnlocked(unlockedIndices, index) {
  return unlockedIndices.includes(index);
}

export function buildEmbedUrl(v) {
  return `https://rutube.ru/play/embed/${v.id}`;
}