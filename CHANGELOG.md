# Changelog

Все заметные изменения в этом проекте будут документироваться в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/),
и проект следует [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-09-13

### Добавлено

- Ежедневный «дозатор» физических видео с вопросами для обсуждения.
- `videos.json`, `config.json` + генератор `available.json` (ежедневный GitHub Action).

## [0.2.0] - 2026-09-22

### Добавлено

- Vite-сборка: логика вынесена из inline-script в модули `src/` (main, scheduler, quiz);
  артефакты коммитятся в корень для GitHub Pages.
- Профили зрителей (`profiles.json`, «Я»/«Сын») с экраном выбора и кнопкой смены.
- Локальный прогресс в `localStorage` (ключ `physicsVideosProgress`):
  viewCount, completed, lastWatchedAt, rating (зарезервировано).
- Просмотренные видео не предлагаются повторно тому же профилю, пока есть непросмотренные
  в открытом пуле; при исчерпании — повтор с пометкой «· уже смотрели».
- Сидирование: три видео, просмотренные сыном на этой неделе, сразу помечены
  completed для профиля «Сын» (одноразовая миграция по маркеру `seeded`).
- JSON Schema (draft 2020-12) на каждый файл данных: `schemas/*.schema.json`
  + `npm run validate` + шаг валидации в workflow.
- Unit-тесты расчёта расписания (node --test).
- Предупреждение в лог workflow при `videos.length < 14`.
- README: архитектура, roadmap, запуск локально.

### Исправлено

- `unlockedIndices` больше не залипает на последних двух видео после исчерпания пула:
  циклический показ (`dayIndex % length`).

[0.1.0]: https://github.com/volgarevmaxim-bit/physics-videos/releases/tag/v0.1.0
[0.2.0]: https://github.com/volgarevmaxim-bit/physics-videos/releases/tag/v0.2.0
