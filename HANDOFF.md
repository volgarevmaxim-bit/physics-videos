# physics-videos — Handoff после этапа 4 (v0.2.0)

> Локальная копия: `C:\Users\volga\physics-videos` (main, 8 коммитов поверх origin/main — **не запушено**: старый git-токен 401).
> Теги: `v0.1.0` (9bb68e1, до этапа), `v0.2.0` (70677e2, релиз этапа 4).

## Что сделано (этап 4, все блоки A–G)

| Блок | Коммит | Суть |
|---|---|---|
| C | 3d3fea4 | Vite 8: src/ (main, scheduler, quiz, index.html), сборка в корень; артефакты index.html + assets/*.js коммитятся = деплой Pages |
| F | a452de3 | Фикс залипания unlockedIndices: todayIdx = dayIndex % length; день 0 → только [0]; warning при <14 видео; 10 node:test |
| A | fc75695 | README (архитектура, roadmap, локальный запуск) |
| D+E | 43d05e6 | Профили me/son (profiles.json), гейт выбора, localStorage physicsVideosProgress, completion ≈90% длительности (таймер, visible-only), сиды 3 видео для «Сын» (seeded=1), повторы с пометкой «· уже смотрели» |
| — | 23783d1 | recordView/markCompleted создают записи полной формы (соответствие progress.schema.json) |
| G | bdd2b84 | 5 JSON Schema (draft 2020-12) + scripts/validate-data.mjs (ajv) + npm run validate + шаг валидации в update-available.yml |
| — | 70677e2 | Release v0.2.0: CHANGELOG (0.1.0 + 0.2.0), package.json 0.2.0 |

## Проверено оркестратором (не со слов суб-агентов)

- `npm run build` ✓ (бандл index-YLswioVB.js, root=src → корень)
- `npm test` 10/10 ✓; `npm run validate` ✓ (4 файла данных)
- Node-проверки state.js: 14/14 (сиды, дублирование, откат версии, viewCount, markCompleted, pickNextVideo, повторы)
- E2E в браузере (http.server :8077): гейт профилей → выбор «Сын» → сиды в localStorage → recordView → маркеры «уже смотрели» → режим повтора при полном пуле → смена профиля → rutube-плеер живой; 0 JS-ошибок в консоли.
- Negative-test валидатора: duration:"258" → валидатор падает с `/0/duration — must be integer`, exit 1.

## Ключевые решения

- **Деплой**: артефакты сборки коммитятся в корень (root=src, outDir=../). Пуш в main = деплой. Никаких Actions на build — Pages-настройки не тронуты.
- **Guard в update-available.mjs**: CLI-код не выполняется при импорте из тестов (`import.meta.url === pathToFileURL(process.argv[1])` с проверкой argv[1] на undefined).
- **applySeed**: маркер `seeded >= seedVersion` (не `===`) — откат версии сида не перезаписывает реальный прогресс.
- **День 0**: открывается только видео [0], не [last,0] — без спойлера пула.
- **progress.schema.json** — документация контракта; клиентская валидация localStorage не выполняется.
- **Аудит-worktree'ы** physics-videos-wt-c2 / -wt-f оставлены в ~/ (удаление через `git worktree remove` требует подтверждения пользователя).

## Что осталось (нужен свежий GitHub-токен)

1. `git push origin main --tags` (8 коммитов + v0.1.0, v0.2.0)
2. Проверить Pages-деплой: https://volgarevmaxim-bit.github.io/physics-videos/ (появятся гейт профилей, кнопка смены, «уже смотрели»; available.json → [0,1])
3. Блок B: Issues по roadmap (множественные источники, ranking, родительский дашборд, геймификация, Rutube Player API) — метки content/ui/automation.
4. В браузере сына: после открытия сайта проверить, что 3 видео не предлагаются.

## Как повторить проверки

```
cd ~/physics-videos
npm ci && npm run build && npm test && npm run validate
python -m http.server 8077   # ручная E2E-проверка
```

## Структура репозитория (после приборки)

```
physics-videos/
├── index.html, assets/     # артефакты Vite — деплой GitHub Pages (коммитятся)
├── src/                    # исходники: index.html, main, scheduler, quiz, state, seed
├── data/                   # videos.json, config.json, profiles.json, available.json
├── schemas/                # 5 JSON Schema (draft 2020-12)
├── scripts/                # update-available.mjs (+тесты), validate-data.mjs
├── .github/workflows/      # update-available.yml (валидация + генерация daily)
├── CHANGELOG.md, README.md, HANDOFF.md, package.json, vite.config.js
```
