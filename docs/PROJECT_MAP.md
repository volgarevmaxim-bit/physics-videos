# PROJECT_MAP — physics-videos

## Дерево

```
physics-videos/
├── index.html, assets/app.js    # артефакты Vite — деплой Pages (коммитятся)
├── src/                          # ИСТОЧНИКИ: index.html, main.js, scheduler.js, quiz.js, state.js, seed.js
├── data/                         # videos.json, config.json, profiles.json, available.json
├── schemas/                      # 5 JSON Schema (draft 2020-12): available, config, profiles, progress, videos
├── scripts/                      # update-available.mjs (+ .test.mjs, 10 тестов), validate-data.mjs
├── .github/workflows/            # update-available.yml — ежедневно 00:05 UTC: validate → генерация available.json → автокоммит
├── docs/                         # этот файл + DECISIONS.md
└── package.json, vite.config.js, CHANGELOG.md, README.md
```

## Модули src/

- **main.js** — точка входа, монтирование
- **scheduler.js** — расписание поверх available.json
- **quiz.js** — рендер вопросов
- **state.js** — профили и прогресс в localStorage (ключ `physicsVideosProgress`, активный профиль `currentProfileId`)
- **seed.js** — сиды профилей, маркер `seeded >= SEED_VERSION` (сравнение нестрогое, чтобы повторно применять сиды при росте версии)

## Данные data/

- **videos.json** — пул (rutube 32-hex id, title, duration сек, questions)
- **config.json** — startDate и пороги
- **profiles.json** — профили
- **available.json** — ГЕНЕРИРУЕТСЯ Action'ом ежедневно, руками не править

## Пайплайн контента

№17 GetAClassVideo (ранжир output/stage3_ranked.csv) → следующие N из ранжира → data/videos.json → npm run validate → commit/push. API-поиск — только проверка конкретного видео; поиск новых видео — без специального указания пользователя (см. AGENTS.md).

## Релиз

build → commit (артефакты+исходники) → bump package.json/CHANGELOG → тег → push --tags. Пуш main = деплой.

## Питфоллы

1) Pages-автотриггер на пуш иногда молчит → пустой коммит `git commit --allow-empty -m "Trigger Pages rebuild" && git push`, проверка GET /repos/…/pages/builds.
2) CDN кэширует assets/app.js 10 минут (Cache-Control: max-age=600), query-param игнорируется — после деплоя проверять с `curl -H "Cache-Control: no-cache"`.
3) Git-токен — GITHUB_TOKEN в dotenv-профиле Hermes (~/.hermes/.env); в чат не печатать, в remote URL не оставлять.
4) `node --test scripts/` каталогом падает на Windows — запускать явный файл.
5) Пуш main = деплой: коммит документации тоже триггерит Pages — это нормально.