import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeSchedule } from './update-available.mjs';

const VIDEOS_8 = [
  { id: 'v1', title: 'Видео 1' },
  { id: 'v2', title: 'Видео 2' },
  { id: 'v3', title: 'Видео 3' },
  { id: 'v4', title: 'Видео 4' },
  { id: 'v5', title: 'Видео 5' },
  { id: 'v6', title: 'Видео 6' },
  { id: 'v7', title: 'Видео 7' },
  { id: 'v8', title: 'Видео 8' },
];

const VIDEOS_1 = [{ id: 'v1', title: 'Одно видео' }];

const VIDEOS_14 = Array.from({ length: 14 }, (_, i) => ({ id: `v${i + 1}`, title: `Видео ${i + 1}` }));

const VIDEOS_15 = Array.from({ length: 15 }, (_, i) => ({ id: `v${i + 1}`, title: `Видео ${i + 1}` }));

const CONFIG = { startDate: '2026-09-13' };

// Helper: make a Date from ISO date string at UTC midnight
function utcDate(dateStr) {
  return new Date(`${dateStr}T00:00:00Z`);
}

describe('computeSchedule', () => {
  it('(a) days > videos.length — циклический показ после исчерпания пула', () => {
    // startDate=2026-09-13, now=2026-09-30 → 17 дней разницы
    const result = computeSchedule({
      videos: VIDEOS_8,
      config: CONFIG,
      now: utcDate('2026-09-30'),
    });
    assert.equal(result.dayIndex, 17);
    assert.deepEqual(result.unlockedIndices, [0, 1]);
  });

  it('(b) days < videos.length — обычный линейный показ', () => {
    // startDate=2026-09-13, now=2026-09-15 → 2 дня разницы
    const result = computeSchedule({
      videos: VIDEOS_8,
      config: CONFIG,
      now: utcDate('2026-09-15'),
    });
    assert.equal(result.dayIndex, 2);
    assert.deepEqual(result.unlockedIndices, [1, 2]);
  });

  it('(c) dayIndex = 0 — только первое видео', () => {
    const result = computeSchedule({
      videos: VIDEOS_8,
      config: CONFIG,
      now: utcDate('2026-09-13'),
    });
    assert.equal(result.dayIndex, 0);
    assert.deepEqual(result.unlockedIndices, [0]);
  });

  it('(d) videos.length = 1 — всегда одно видео', () => {
    const result = computeSchedule({
      videos: VIDEOS_1,
      config: CONFIG,
      now: utcDate('2026-09-15'),
    });
    assert.equal(result.dayIndex, 2);
    assert.deepEqual(result.unlockedIndices, [0]);
  });

  it('(e1) warning при videos.length < 14', () => {
    const result = computeSchedule({
      videos: VIDEOS_8,
      config: CONFIG,
      now: utcDate('2026-09-13'),
    });
    assert.ok(result.warning);
    assert.match(result.warning, /менее 14|меньше 14|< 14|videos\.json содержит/);
  });

  it('(e2) нет warning при videos.length = 14', () => {
    const result = computeSchedule({
      videos: VIDEOS_14,
      config: CONFIG,
      now: utcDate('2026-09-13'),
    });
    assert.equal(result.warning, null);
  });

  it('(e3) нет warning при videos.length > 14', () => {
    const result = computeSchedule({
      videos: VIDEOS_15,
      config: CONFIG,
      now: utcDate('2026-09-13'),
    });
    assert.equal(result.warning, null);
  });

  it('(f) startDate в будущем — dayIndex=0, только первое видео', () => {
    const futureConfig = { startDate: '2026-09-30' };
    const result = computeSchedule({
      videos: VIDEOS_8,
      config: futureConfig,
      now: utcDate('2026-09-13'),
    });
    assert.equal(result.dayIndex, 0);
    assert.deepEqual(result.unlockedIndices, [0]);
  });

  it('циклический показ: dayIndex кратен длине пула', () => {
    // 8-й день: dayIndex=8, todayIdx=8%8=0, yesterdayIdx=7
    const result = computeSchedule({
      videos: VIDEOS_8,
      config: CONFIG,
      now: utcDate('2026-09-21'),
    });
    assert.equal(result.dayIndex, 8);
    assert.deepEqual(result.unlockedIndices, [0, 7]);
  });

  it('циклический показ: день после оборота', () => {
    // 9-й день: dayIndex=9, todayIdx=9%8=1, yesterdayIdx=0
    const result = computeSchedule({
      videos: VIDEOS_8,
      config: CONFIG,
      now: utcDate('2026-09-22'),
    });
    assert.equal(result.dayIndex, 9);
    assert.deepEqual(result.unlockedIndices, [0, 1]);
  });
});