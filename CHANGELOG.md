# Changelog

Все заметные изменения в этом проекте будут документироваться в этом файле.

Формат основан на [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/),
и проект следует [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-09-22

### Добавлено

- Unit-тесты расчёта расписания (node --test).
- Предупреждение в лог workflow при `videos.length < 14`.

### Исправлено

- `unlockedIndices` больше не залипает на последних двух видео после исчерпания пула:
  циклический показ (`dayIndex % length`).

[0.2.0]: https://github.com/volgarevmaxim-bit/physics-videos/releases/tag/v0.2.0