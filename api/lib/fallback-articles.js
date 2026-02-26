import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const jsonPath = join(__dirname, '..', '..', 'assets', 'data', 'fallback-articles.json');

export const fallbackArticles = JSON.parse(readFileSync(jsonPath, 'utf-8'));
