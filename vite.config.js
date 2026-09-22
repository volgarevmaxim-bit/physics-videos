import { defineConfig } from 'vite';

// Источник — src/ (там index.html + модули), артефакты сборки — в корень репозитория.
// Корень репозитория остаётся корнем GitHub Pages: index.html + assets/ в репо = готовый деплой.
// JSON-данные живут в data/ и на Pages отдаются как есть (data/*.json),
// во время dev-сервера доступны по относительному пути из корня (server.fs.allow).
export default defineConfig({
  base: './',
  root: 'src',
  build: {
    outDir: '../',
    emptyOutDir: false
  },
  server: {
    // npm run dev: чтобы fetch('videos.json') находил данные в корне репо
    fs: { allow: ['..'] }
  }
});
