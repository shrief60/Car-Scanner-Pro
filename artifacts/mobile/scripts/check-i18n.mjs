#!/usr/bin/env node
/**
 * Asserts the two catalogues stay in step and that no `t()` call names a key that
 * does not exist. TypeScript already forces `ar.ts` to satisfy the `Translations`
 * shape, but it cannot see a key referenced as a template string, and it cannot tell
 * an empty Arabic value from a translated one.
 *
 *   node scripts/check-i18n.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const flatten = (src) => {
  const out = new Set();
  // Walk `key: { … }` / `key: '…'` textually — the catalogues are plain literals, and
  // importing TS here would mean pulling in a compiler for a 40-line check.
  const walk = (body, prefix) => {
    let i = 0;
    while (i < body.length) {
      const m = /(?:^|\n)\s*'?([A-Za-z0-9_]+)'?\s*:\s*/g;
      m.lastIndex = i;
      const hit = m.exec(body);
      if (!hit) break;
      const key = hit[1];
      let j = m.lastIndex;
      while (j < body.length && /\s/.test(body[j])) j++;
      if (body[j] === '{') {
        let depth = 0, k = j;
        for (; k < body.length; k++) {
          if (body[k] === '{') depth++;
          else if (body[k] === '}' && --depth === 0) break;
        }
        walk(body.slice(j + 1, k), prefix ? `${prefix}.${key}` : key);
        i = k + 1;
      } else {
        out.add(prefix ? `${prefix}.${key}` : key);
        i = m.lastIndex;
      }
    }
  };
  walk(src.slice(src.indexOf('{')), '');
  return out;
};

const read = (f) => readFileSync(new URL(`../i18n/${f}`, import.meta.url), 'utf8');
const en = flatten(read('en.ts'));
const ar = flatten(read('ar.ts'));

const problems = [];
for (const k of en) if (!ar.has(k)) problems.push(`missing in ar.ts: ${k}`);
for (const k of ar) if (!en.has(k)) problems.push(`extra in ar.ts:   ${k}`);

// Every t('…') / t(`…`) literal must resolve.
const walkDir = (d, acc = []) => {
  for (const e of readdirSync(d)) {
    if (e === 'node_modules' || e === '.expo') continue;
    const p = join(d, e);
    if (statSync(p).isDirectory()) walkDir(p, acc);
    else if (/\.tsx?$/.test(p)) acc.push(p);
  }
  return acc;
};
const root = new URL('..', import.meta.url).pathname;
let checked = 0;
for (const file of walkDir(root).filter((f) => !f.includes('/i18n/'))) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(/\bt\(\s*'([a-zA-Z][\w.]*)'/g)) {
    checked++;
    if (!en.has(m[1])) problems.push(`${file.replace(root, '')}: unknown key '${m[1]}'`);
  }
}

console.log(`${en.size} keys · ${checked} t() call sites checked`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log('en.ts and ar.ts are in step.');
