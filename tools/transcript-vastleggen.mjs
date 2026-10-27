// Legt het ruwe transcript van de huidige Claude Code-sessie vast in ai-sessies/<branch>/.
// Gebruik: npm run transcript            (de meest recente sessie in deze map)
//          npm run transcript -- <id>    (een bepaalde sessie)
// Neemt ook de transcripten van subagents mee. Stopt als er iets op een geheim lijkt.
import { readdirSync, statSync, readFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { root } from './pakket.mjs';

// Claude Code bewaart sessies per projectmap, bv. C:\git\demo-ai-regeling -> C--git-demo-ai-regeling
const projecten = join(process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), '.claude'), 'projects');
const map = join(projecten, root.replace(/[^a-zA-Z0-9]/g, '-'));
if (!existsSync(map)) { console.error(`Geen sessies gevonden in ${map}`); process.exit(1); }

const sessies = readdirSync(map).filter((f) => f.endsWith('.jsonl'))
  .map((f) => ({ id: f.slice(0, -6), tijd: statSync(join(map, f)).mtimeMs }))
  .sort((a, b) => b.tijd - a.tijd);
const id = process.argv[2] ?? sessies[0]?.id;
if (!id || !existsSync(join(map, `${id}.jsonl`))) { console.error('Sessie niet gevonden.'); process.exit(1); }

const bestanden = [[join(map, `${id}.jsonl`), `${id}.jsonl`]];
const subMap = join(map, id, 'subagents');
if (existsSync(subMap))
  for (const f of readdirSync(subMap).filter((f) => f.endsWith('.jsonl')))
    bestanden.push([join(subMap, f), join('subagents', f)]);

// Eenvoudige controle op geheimen (tokens, sleutels, wachtwoorden).
const geheim = /(gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-ant-[A-Za-z0-9-]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|"password"\s*:\s*"[^"]+")/;
for (const [bron] of bestanden) {
  const m = readFileSync(bron, 'utf8').match(geheim);
  if (m) { console.error(`Gestopt: mogelijk geheim gevonden in ${bron} (${m[0].slice(0, 4)}…). Niets vastgelegd.`); process.exit(1); }
}

const branch = execFileSync('git', ['branch', '--show-current'], { cwd: root, encoding: 'utf8' }).trim();
const doel = join(root, 'ai-sessies', branch);
for (const [bron, naam] of bestanden) {
  mkdirSync(join(doel, naam, '..'), { recursive: true });
  copyFileSync(bron, join(doel, naam));
}
console.log(`Vastgelegd in ai-sessies/${branch}/: sessie ${id}, ${bestanden.length - 1} subagent(s). Op geheimen gescand: schoon.`);
