// Maakt formulier.html: het aanvraagformulier zoals een aanvrager het ziet. Gebruik: npm run formulier
// Vragen die er bij de tag "beginstand" nog niet waren, krijgen het label NIEUW.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { parse } from 'yaml';
import { root, leesPakket, velden, schemaVoor, isVerplicht } from './pakket.mjs';

const p = leesPakket();
const t = p.teksten;

let oudePaden = null;
try {
  const oud = execFileSync('git', ['show', 'beginstand:pakket/aanvraag/wizard.yaml'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  oudePaden = new Set(velden(parse(oud)).map((v) => v.pad));
} catch { /* geen git of geen tag: dan geen NIEUW-labels */ }

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const id = (pad) => 'v-' + pad.replace(/\./g, '-');

function invoer(v, tekst, s) {
  const naam = `name="${esc(v.pad)}" id="${id(v.pad)}"`;
  switch (v.type) {
    case 'keuze': {
      const opties = Object.entries(tekst.opties ?? {});
      const soort = s.type === 'boolean' && opties.length === 1 ? 'checkbox' : 'radio';
      return `<div class="opties">${opties.map(([w, l]) =>
        `<label class="optie"><input type="${soort}" ${naam.replace(/ id="[^"]*"/, '')} value="${esc(w)}"> ${esc(l)}</label>`).join('')}</div>`;
    }
    case 'datum': return `<input type="date" ${naam}>`;
    case 'getal': return `<input type="number" inputmode="numeric" ${naam}>`;
    case 'bedrag': return `<div class="bedrag"><span>€</span><input type="number" inputmode="decimal" ${naam}></div>`;
    case 'upload': return `<input type="file" ${naam}>`;
    default: return v.meerregelig ? `<textarea rows="3" ${naam}></textarea>` : `<input type="text" ${naam}>`;
  }
}

function veldHtml(v) {
  const tekst = t.velden?.[v.pad] ?? { label: `⚠ geen tekst voor ${v.pad}` };
  const s = schemaVoor(p.schema, v.pad) ?? {};
  const nieuw = oudePaden && !oudePaden.has(v.pad);
  const bronnen = (v.req ?? []).map((r) => `${r} · ${p.trace.eisen?.[r]?.bron ?? 'geen bron'}`).join(', ');
  const attrs = [
    `class="veld${nieuw ? ' nieuw' : ''}"`,
    v.zichtbaarAls ? `data-zichtbaar-veld="${esc(v.zichtbaarAls.veld)}" data-zichtbaar-is="${esc(v.zichtbaarAls.is)}"` : '',
    v.signalering ? `data-onder="${esc(v.signalering.onder ?? '')}" data-boven="${esc(v.signalering.boven ?? '')}"` : '',
  ].join(' ');
  return `<div ${attrs}>
  <label class="label" for="${id(v.pad)}">${esc(tekst.label)}${isVerplicht(p.schema, v.pad) ? '' : ' <span class="optioneel">(niet verplicht)</span>'}${nieuw ? ' <span class="badge">NIEUW</span>' : ''}</label>
  ${tekst.hulp ? `<p class="hulp">${esc(tekst.hulp)}</p>` : ''}
  ${invoer(v, tekst, s)}
  ${tekst.signalering ? `<p class="signalering" hidden>⚠ ${esc(tekst.signalering)}</p>` : ''}
  <p class="bron">${esc(bronnen)}</p>
</div>`;
}

const stappen = p.wizard.stappen.map((stap, i) => `<section class="stap">
  <h2><span class="nr">${i + 1}</span>${esc(t.stappen?.[stap.id]?.titel ?? stap.id)}</h2>
  ${t.stappen?.[stap.id]?.intro ? `<p class="hulp">${esc(t.stappen[stap.id].intro)}</p>` : ''}
  ${stap.velden.map(veldHtml).join('\n')}
</section>`).join('\n');

const html = `<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t.titel)}</title>
<style>
:root { --blauw:#154273; --licht:#e8f0f8; --tekst:#1b1b1b; --grijs:#5f6b7a; --rand:#cfd6de; --geel:#fff4cc; --geelrand:#e0b300; --nieuw:#0a7d32; --achter:#f3f5f7; }
* { box-sizing:border-box; }
body { margin:0; font:16px/1.5 system-ui, "Segoe UI", sans-serif; color:var(--tekst); background:var(--achter); }
header { background:var(--blauw); color:#fff; padding:20px 16px; }
header .in, main { max-width:720px; margin:0 auto; }
header h1 { margin:0; font-size:1.5rem; }
header p { margin:4px 0 0; opacity:.85; }
.fictief { background:#ffe8e8; color:#8a1c1c; text-align:center; font-weight:600; padding:6px 16px; font-size:.9rem; }
main { padding:16px; }
.meta { color:var(--grijs); font-size:.85rem; margin:0 0 12px; }
.stap { background:#fff; border:1px solid var(--rand); border-radius:6px; padding:20px; margin:0 0 16px; }
.stap h2 { margin:0 0 12px; font-size:1.2rem; color:var(--blauw); display:flex; align-items:center; gap:10px; }
.nr { background:var(--blauw); color:#fff; width:28px; height:28px; border-radius:50%; display:inline-grid; place-items:center; font-size:.9rem; }
.veld { padding:12px 0; border-top:1px solid #eef1f4; }
.veld.nieuw { background:#eaf7ee; border:2px solid var(--nieuw); border-radius:6px; padding:12px; margin:8px -12px; }
.label { display:block; font-weight:600; }
.optioneel { font-weight:400; color:var(--grijs); }
.badge { background:var(--nieuw); color:#fff; font-size:.7rem; font-weight:700; padding:2px 6px; border-radius:4px; margin-left:6px; vertical-align:middle; }
.hulp { margin:2px 0 6px; color:var(--grijs); font-size:.92rem; }
input[type=text], input[type=number], input[type=date], textarea { width:100%; max-width:480px; font:inherit; padding:8px 10px; border:1px solid #8a96a3; border-radius:4px; margin-top:4px; }
.bedrag { display:flex; align-items:center; gap:6px; max-width:240px; }
.opties { display:flex; flex-direction:column; gap:4px; margin-top:4px; }
.signalering { background:var(--geel); border-left:4px solid var(--geelrand); padding:8px 10px; margin:8px 0 0; font-size:.92rem; }
.bron { margin:6px 0 0; font-size:.75rem; color:var(--grijs); font-family:ui-monospace, Consolas, monospace; }
.knop { background:var(--blauw); color:#fff; border:0; padding:10px 20px; border-radius:4px; font:inherit; font-weight:600; }
</style></head>
<body>
<div class="fictief">FICTIEF — deze regeling bestaat niet (demo)</div>
<header><div class="in"><h1>${esc(t.titel)}</h1><p>${esc(t.intro)}</p></div></header>
<main>
<p class="meta">Pakketversie ${esc(p.versie.versie)} · gemaakt uit de bestanden in <code>pakket/</code> · grijze regel onder een vraag = eis en artikel</p>
${stappen}
<button class="knop" type="button">Aanvraag indienen</button>
</main>
<script>
function waarde(naam) {
  const els = document.querySelectorAll('[name="' + naam + '"]');
  for (const el of els) if ((el.type === 'radio' || el.type === 'checkbox') ? el.checked : true) return el.value;
  return '';
}
function ververs() {
  document.querySelectorAll('[data-zichtbaar-veld]').forEach((d) => { d.hidden = waarde(d.dataset.zichtbaarVeld) !== d.dataset.zichtbaarIs; });
  document.querySelectorAll('[data-onder], [data-boven]').forEach((d) => {
    const v = d.querySelector('input'); const s = d.querySelector('.signalering'); if (!v || !s) return;
    const n = parseFloat(v.value);
    const onder = d.dataset.onder !== '' && n < parseFloat(d.dataset.onder);
    const boven = d.dataset.boven !== '' && n > parseFloat(d.dataset.boven);
    s.hidden = isNaN(n) || !(onder || boven);
  });
}
document.addEventListener('input', ververs); document.addEventListener('change', ververs); ververs();
</script>
</body></html>
`;

const uit = join(root, 'formulier.html');
writeFileSync(uit, html);
console.log(`Formulier gemaakt: ${uit}`);
if (process.argv.includes('--open')) {
  const [cmd, args] = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', uit]] : [process.platform === 'darwin' ? 'open' : 'xdg-open', [uit]];
  execFileSync(cmd, args, { stdio: 'ignore' });
}
