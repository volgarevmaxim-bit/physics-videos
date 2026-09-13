// Генерирует available.json: какие видео открыты сегодня (сегодняшнее + вчерашнее).
// Запускается вручную (node scripts/update-available.mjs) и ежедневно через GitHub Actions.
import { readFileSync, writeFileSync } from 'node:fs';

const videos = JSON.parse(readFileSync('videos.json', 'utf8'));
const config = JSON.parse(readFileSync('config.json', 'utf8'));

const start = new Date(`${config.startDate}T00:00:00Z`);
const now = new Date();
const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

let dayIndex = Math.floor((todayUTC - start) / 86400000);
if (dayIndex < 0) dayIndex = 0;

const maxIndex = videos.length - 1;
const todayIdx = Math.min(dayIndex, maxIndex);
const yesterdayIdx = Math.max(todayIdx - 1, 0);
const unlockedIndices = [...new Set([yesterdayIdx, todayIdx])].sort((a, b) => a - b);

const result = {
  generatedAt: now.toISOString(),
  startDate: config.startDate,
  dayIndex,
  unlockedIndices
};

writeFileSync('available.json', `${JSON.stringify(result, null, 2)}\n`);
console.log('available.json updated:', result);
