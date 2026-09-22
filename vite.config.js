import { defineConfig } from 'vite';

// Источник — src/ (там index.html + модули), артефакты сборки — в корень репозитория.
// Корень репозитория остаётся корнем GitHub Pages: index.html + assets/app.js в репо = готовый деплой.
// Бандл с фиксированным именем assets/app.js (без хэша): emptyOutDir=false не чистит каталог,
// хэшированные имена накапливали бы мёртвые файлы. Pages-кэш ~10 минут — приемлемо.
// JSON-данные живут в data/ и на Pages отдаются как есть (data/*.json),
// во время dev-сервера доступны по относительному пути из корня (server.fs.allow).
export default defineConfig({
  base: './',
  root: 'src',
  build: {
    outDir: '../',
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js'
      }
    }
  },
  server: {
    // npm run dev: чтобы fetch('data/*.json') находил данные в корне репо
    fs: { allow: ['..'] }
  }
});
