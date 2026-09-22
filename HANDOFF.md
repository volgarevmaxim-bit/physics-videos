# physics-videos — HANDOFF для следующей сессии (v0.2.2)

> **Точка входа.** Проект №20 в Hermes_Project_INDEX.md. Дозатор физических видео для ребёнка (GitHub Pages).
> Сайт: https://volgarevmaxim-bit.github.io/physics-videos/ · Репо: volgarevmaxim-bit/physics-videos · Локально: `C:\Users\volga\physics-videos` (main = origin/main, `8b4d589`).

## Где мы (2026-09-22)

- **v0.2.2 live.** Этап 4 (задание `agent-task-stage_4.md`, блоки A–G) закрыт полностью: профили «Я»/«Сын» + прогресс в localStorage, Vite-сборка, 5 JSON Schema + валидатор, циклическое расписание (фикс залипания unlockedIndices), README, бэклог-issues №2–№6 с метками.
- v0.2.1: utility-bar над видео + гамбургер (смена профиля, больше не перекрывает видео); 3 просмотренных видео заменены на топ-3 ранжира GetAClass.
- v0.2.2: подписи видео в списке ≤2 слов (стоп-слова не занимают слот).
- Теги `v0.1.0`–`v0.2.2` на GitHub. Git-токен: `GITHUB_TOKEN` в `~/.hermes/.env` (dotenv; значение не печатать, грузить `set -a; source …; set +a`).

## Проверка за 2 минуты (перед началом работ)

```
cd ~/physics-videos && git pull
npm ci && npm run build && npm test && npm run validate   # всё должно быть зелёным
python -m http.server 8077    # E2E: http://localhost:8077/ → гейт → «Сын» → видео
curl -s https://volgarevmaxim-bit.github.io/physics-videos/data/available.json   # прод-расписание
```

## Как менять код (важно!)

- **Исходники — `src/`; корневые `index.html` + `assets/app.js` — артефакты Vite.** После правок `src/` обязательно `npm run build` и коммит артефактов вместе с исходниками (пуш в main = деплой Pages).
- Vite: `root: 'src'`, `outDir: '../'`, `emptyOutDir: false`, бандл с фиксированным именем `assets/app.js` (без хэша — против накопления мёртвых бандлов).
- Релиз: правки → build → коммит → `package.json`/CHANGELOG bump → тег `vX.Y.Z` → push main --tags.
- Данные: `data/videos.json` (id = rutube 32-hex, title, duration сек, questions), `data/profiles.json`, `data/config.json` (startDate), `data/available.json` (генерируется Action).
- Прогресс: localStorage `physicsVideosProgress` (схема `schemas/progress.schema.json`), текущий профиль — `currentProfileId`. Сиды — `src/seed.js` (SEED_VERSION, маркер `seeded >= SEED_VERSION`).
- Workflow `.github/workflows/update-available.yml`: ежедневно 00:05 UTC — `npm run validate` → генерация `data/available.json` → автокоммит.

## Питфоллы (проверено кровью)

1. **Pages-автотриггер на пуш иногда молчит** — билд не запускается. Лечение: пустой коммит `git commit --allow-empty -m "Trigger Pages rebuild" && git push`. Проверять: `GET /repos/…/pages/builds`.
2. **CDN кэширует `assets/app.js` 10 минут** (`Cache-Control: max-age=600`) — query-param игнорируется. После деплоя проверять с `curl -H "Cache-Control: no-cache"`.
3. **Rutube-видео ищутся через открытый API** `https://rutube.ru/api/search/video/?query=<заголовок>+GetAClass` (нужен User-Agent; без авторизации). Первый результат проверять по `author.name = "GetAClass - Физика и математика"` и совпадению `duration` с отчётом ранжира.
4. **Git-токен** — fine-grained PAT в `~/.hermes/.env` (GITHUB_TOKEN). Пуш: `git push https://volgarevmaxim-bit:$GITHUB_TOKEN@github.com/…` (в remote URL не оставлять).
5. `node --test scripts/` (каталогом) падает на Windows — запускать конкретный файл: `node --test scripts/update-available.test.mjs`.
6. write_file/patch на `Hermes_Project_INDEX.md` требует подтверждения кликом в UI — approval-таймаут блокирует запись.

## Что дальше (roadmap = issues в репо)

| # | Задача | Метки |
|---|---|---|
| 6 | Множественные источники контента (пополнение пула; импорт из отбора GetAClass `output/stage3_ranked.csv`) | content, automation |
| 2 | Ранжирование по интересу/усвоению (rating-поле уже в схеме) | content |
| 3 | Родительский дашборд (прогресс профилей без DevTools) | ui |
| 4 | Геймификация: стрики и ачивки | ui |
| 5 | Rutube Player API — честный completed (сейчас эвристика: 90% времени на странице) | automation |

Текущий пул: 8 видео, warning при <14 — следующее пополнение пула желательно в ближайшие дни.

## Хвосты

1. В браузере сына: проверить, что 3 видео прошлой недели помечены «· уже смотрели» и не предлагаются (сид применится при первом заходе под профилем «Сын»).
2. Аудит-worktree'ы `~/physics-videos-wt-c2`, `~/physics-videos-wt-f` — можно удалить (`git worktree remove`), исторические ветки block-c2/block-f уже вмержены.

## Структура

```
physics-videos/
├── index.html, assets/app.js   # артефакты Vite — деплой Pages (коммитятся!)
├── src/                        # исходники: index.html, main, scheduler, quiz, state, seed
├── data/                       # videos.json, config.json, profiles.json, available.json
├── schemas/                    # 5 JSON Schema (draft 2020-12), npm run validate
├── scripts/                    # update-available.mjs (+10 тестов), validate-data.mjs
├── .github/workflows/          # update-available.yml (валидация → генерация → коммит, daily)
└── CHANGELOG.md, README.md, HANDOFF.md, package.json, vite.config.js
```

Ключевые решения (коротко): артефакты в корне = деплой; guard `isMain` в update-available.mjs; `applySeed` — маркер `>=`; день 0 → только [0]; progress.schema.json — контракт без клиентской валидации.
