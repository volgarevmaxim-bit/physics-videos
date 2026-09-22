/**
 * scripts/validate-data.mjs — Валидация JSON-файлов данных по JSON Schema (draft 2020-12).
 *
 * Используется ajv/dist/2020 (draft 2020-12) со строгой валидацией форматов.
 * Форматы date / date-time проверяются через кастомные regexp-форматы,
 * добавленные методом addFormat (строгий режим форматов — preferred).
 *
 * Валидируются: videos.json, config.json, profiles.json, available.json.
 * progress.schema.json — документация контракта localStorage, не валидируется здесь.
 */

import Ajv from 'ajv/dist/2020.js';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// --- Инициализация ajv (draft 2020-12) со строгой валидацией форматов ---
const ajv = new Ajv({
  strictSchema: true,
  strict: true,
  allowUnionTypes: true,  // для anyOf: null | integer
});

// Кастомные форматы — строгая проверка (предпочтительный режим)
ajv.addFormat('date', /^\d{4}-\d{2}-\d{2}$/);
ajv.addFormat('date-time', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/);

// --- Загрузка схем ---
const SCHEMAS = [
  { file: 'videos.schema.json',    dataFile: 'data/videos.json' },
  { file: 'config.schema.json',    dataFile: 'data/config.json' },
  { file: 'profiles.schema.json',  dataFile: 'data/profiles.json' },
  { file: 'available.schema.json', dataFile: 'data/available.json' },
];

function loadJSON(path) {
  const fullPath = resolve(ROOT, path);
  if (!existsSync(fullPath)) {
    console.error(`Файл не найден: ${path}`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(fullPath, 'utf8'));
}

// --- Валидация ---
let allOk = true;

for (const { file, dataFile } of SCHEMAS) {
  const schemaPath = `schemas/${file}`;
  const dataPath   = dataFile;

  const schema = loadJSON(schemaPath);
  const data   = loadJSON(dataPath);

  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (!valid) {
    allOk = false;
    console.error(`\nОШИБКА: ${dataFile} не прошёл валидацию по ${schemaPath}:`);
    for (const err of validate.errors) {
      console.error(`  ${err.instancePath || '(root)'} — ${err.message}`);
      if (err.params) {
        console.error(`    params: ${JSON.stringify(err.params)}`);
      }
    }
  }
}

if (allOk) {
  console.log('OK: data/*.json валидны');
  process.exit(0);
} else {
  process.exit(1);
}