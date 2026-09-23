# AGENTS.md — physics-videos

Что это: Ежедневный «дозатор» физических видео с квизами для ребёнка. GitHub Pages, чистая статика, бэкенда нет. Проект №20 в Hermes_Project_INDEX.md (`C:\Users\volga\.hermes\Hermes_Project_INDEX.md`). Источник контента — проект №17 GetAClassVideo (`C:\Users\volga\GetAClassVideo`). Сайт: https://volgarevmaxim-bit.github.io/physics-videos/ · Репо: volgarevmaxim-bit/physics-videos.

## Протокол начала задачи

Перед началом любой задачи в этом репозитории: 1) прочитай handoff.md в корне — там текущий статус и следующий шаг; 2) прочитай docs/PROJECT_MAP.md — там структура проекта; НЕ сканируй остальные файлы кодовой базы, если задача явно не требует правки конкретного модуля. 3) Если handoff.md отсутствует или пуст — тогда и только тогда сделай разовый обзор структуры и создай его. В конце сессии — если работа не завершена — обнови handoff.md: что сделано, что осталось, какие файлы изменены, какие решения приняты и почему (кратко, 1 строка на пункт). Если задача завершена полностью — очисти handoff.md до шаблона «нет активной задачи».

## Команды

- Полный гейт перед завершением: `npm ci && npm run build && npm test && npm run validate` (всё зелёное; git status чист — артефакты не должны разойтись с src/).
- Тесты отдельно: `npm test` (обёртка над node --test scripts/update-available.test.mjs).
- Локальный просмотр: `npm run dev` или `python -m http.server 8077` из корня.

## Как менять код

- Исходники — `src/`; корневые `index.html` и `assets/app.js` — АРТЕФАКТЫ Vite, не редактировать руками.
- После правок src/ обязательно `npm run build`; артефакты коммитятся вместе с исходниками одним коммитом.
- Пуш в main = деплой Pages. Релиз: правки → build → коммит → bump package.json + CHANGELOG.md → тег vX.Y.Z → push main --tags.

## Источник контента

Единственный источник видео для пула — проект №17 GetAClassVideo (`C:\Users\volga\GetAClassVideo`): ранжир `output/stage3_ranked.csv`, отчёт `output/stage3_report.md`, БД `data/getaclass.db`. Брать видео с verdict_9yo = yes/borderline по убыванию ранга. Автоматический поиск новых видео не выполняется. Открытый API Rutube (`https://rutube.ru/api/search/video/?query=…`, обязателен User-Agent) разрешён ТОЛЬКО для проверки доступности конкретного известного видео или сопоставления id уже отобранного ролика (сверять author.name = «GetAClass - Физика и математика» и duration с ранжиром). Поиск новых видео — запрещён без специального указания пользователя (планируется отдельным этапом проекта). Пополнение пула по умолчанию: следующие N видео из ранжира №17 → `data/videos.json` (rutube 32-hex id, title, duration в секундах, questions) → `npm run validate` → commit/push.

## Где что искать

- структура — docs/PROJECT_MAP.md
- почему так — docs/DECISIONS.md
- текущий статус — handoff.md (корень, вне git)
- roadmap — GitHub issues №2–№6
