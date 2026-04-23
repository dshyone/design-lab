#!/usr/bin/env node
/**
 * Usage: node scripts/add-asset.mjs --name "My asset" --type svg --file "assets/my-file.svg" --addedBy "Chuka"
 * Appends a new entry to assets.json.
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
}

const name = getArg('name');
const type = getArg('type') ?? 'other';
const file = getArg('file');
const addedBy = getArg('addedBy') ?? 'Craig';
const description = getArg('description') ?? '';
const tagsRaw = getArg('tags') ?? '';

if (!name || !file) {
  console.error('Usage: node scripts/add-asset.mjs --name "..." --file "assets/..." [--type svg|html|angular|other] [--addedBy "Craig"] [--description "..."] [--tags "tag1,tag2"]');
  process.exit(1);
}

const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()) : [];
const date = new Date().toISOString().slice(0, 10);

const entry = { id, name, type, description, file, tags, addedBy, date };
const jsonPath = resolve(root, 'assets.json');
const existing = JSON.parse(readFileSync(jsonPath, 'utf8'));
writeFileSync(jsonPath, JSON.stringify([entry, ...existing], null, 2));
console.log(`Added asset: ${name} (${id})`);
console.log('Done. Commit assets.json to push to Design Lab.');
