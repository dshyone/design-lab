#!/usr/bin/env node
/**
 * Usage: node scripts/add-prototype.mjs --title "My exploration" --tags "animation,button" --creator "Craig" --folder "prototypes/my-exploration"
 * Appends a new entry to prototypes.json and creates the prototype folder.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
}

const title = getArg('title');
const tagsRaw = getArg('tags') ?? '';
const creator = getArg('creator') ?? 'Craig';
const folder = getArg('folder');
const description = getArg('description') ?? '';
const thumbnail = getArg('thumbnail') ?? undefined;

if (!title || !folder) {
  console.error('Usage: node scripts/add-prototype.mjs --title "..." --folder "prototypes/..." [--tags "tag1,tag2"] [--creator "Craig"] [--description "..."]');
  process.exit(1);
}

const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()) : [];
const date = new Date().toISOString().slice(0, 10);

const entry = { id, title, tags, creator, date, description, folder, ...(thumbnail ? { thumbnail } : {}) };

const jsonPath = resolve(root, 'prototypes.json');
const existing = JSON.parse(readFileSync(jsonPath, 'utf8'));
const updated = [entry, ...existing];
writeFileSync(jsonPath, JSON.stringify(updated, null, 2));
console.log(`Added: ${title} (${id})`);

const folderPath = resolve(root, folder);
if (!existsSync(folderPath)) {
  mkdirSync(folderPath, { recursive: true });
  writeFileSync(resolve(folderPath, '.gitkeep'), '');
  console.log(`Created folder: ${folder}`);
}

console.log('Done. Commit prototypes.json and the new folder to push to Design Lab.');
