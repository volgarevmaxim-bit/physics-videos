// Генерирует available.json: какие видео открыты сегодня (сегодняшнее + вчерашнее).
// Запускается вручную (node scripts/update-available.mjs) и ежедневно через GitHub Actions.
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/**
 * Вычисляет расписание открытых видео на указанную дату.
 *
 * Алгоритм:
 *  - dayIndex = max(0, floor((todayUTC − startDateUTC) / 86400000))
 *  - todayIdx = dayIndex % videos.length  (циклический показ после исчерпания пула)
 *  - yesterdayIdx — особый случай дня 0:
 *      * Если dayIndex === 0 → yesterdayIdx = 0 (не открываем последнее видео — спойлер)
 *      * Иначе → yesterdayIdx = (todayIdx − 1 + len) % len
 *  - unlockedIndices = [...new Set([yesterdayIdx, todayIdx])].sort(asc)
 *
 * @param {{videos: Array, config: {startDate: string}, now: Date}} params
 * @returns {{dayIndex: number, unlockedIndices: number[], warning: string|null}}
 */
export function computeSchedule({ videos, config, now }) {
  const start = new Date(`${config.startDate}T00:00:00Z`);
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  let dayIndex = Math.floor((todayUTC - start) / 86400000);
  if (dayIndex < 0) dayIndex = 0;

  const len = videos.length;
  const todayIdx = dayIndex % len;
  // День 0: открываем только первое видео, чтобы не спойлерить весь пул.
  const yesterdayIdx = dayIndex === 0 ? 0 : (todayIdx - 1 + len) % len;
  const unlockedIndices = [...new Set([yesterdayIdx, todayIdx])].sort((a, b) => a - b);

  let warning = null;
  if (len < 14) {
    warning = `Warning: videos.json содержит ${len} видео (< 14) — пул будет циклиться с повторами раньше 2 недель`;
  }

  return { dayIndex, unlockedIndices, warning };
}

// Основной путь (CLI / GitHub Actions). Guard: не выполняется при импорте из тестов.
const isMain = typeof process.argv[1] === 'string'
  && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const videos = JSON.parse(readFileSync('videos.json', 'utf8'));
  const config = JSON.parse(readFileSync('config.json', 'utf8'));

  const schedule = computeSchedule({ videos, config, now: new Date() });

  const result = {
    generatedAt: new Date().toISOString(),
    startDate: config.startDate,
    dayIndex: schedule.dayIndex,
    unlockedIndices: schedule.unlockedIndices,
  };

  writeFileSync('available.json', `${JSON.stringify(result, null, 2)}\n`);
  console.log('available.json updated:', JSON.stringify(result));

  if (schedule.warning) {
    console.warn(schedule.warning);
  }
}