// Maakt formulier.html: het aanvraagformulier zoals een aanvrager het ziet, in de huisstijl van ROOS
// (RVO-ontwerpsysteem, uit node_modules/@nl-rvo). Gebruik: npm run formulier
// Vragen die er bij de tag "beginstand" nog niet waren, krijgen het label NIEUW.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { parse } from 'yaml';
import { root, leesPakket, velden, schemaVoor } from './pakket.mjs';

const p = leesPakket();
const t = p.teksten;

let oudePaden = null;
try {
  const oud = execFileSync('git', ['show', 'beginstand:pakket/aanvraag/wizard.yaml'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  oudePaden = new Set(velden(parse(oud)).map((v) => v.pad));
} catch { /* geen git of geen tag: dan geen NIEUW-labels */ }

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const id = (pad) => 'v-' + pad.replace(/\./g, '-');
const icoon = (naam, maat = 'md') =>
  `<span class="utrecht-icon rvo-icon rvo-icon--${maat} rvo-icon-${naam} rvo-status-icon-${naam}" role="img" aria-hidden="true"></span>`;

// Invoerelementen met de klassen van ROOS (zoals component-library-react ze maakt).
function invoer(v, tekst, s) {
  const naam = `name="${esc(v.pad)}"`;
  const textbox = 'utrecht-textbox utrecht-textbox--html-input';
  switch (v.type) {
    case 'keuze': {
      const opties = Object.entries(tekst.opties ?? {});
      if (s.type === 'boolean' && opties.length === 1) {
        const [w, l] = opties[0];
        return `<div class="rvo-checkbox__group"><label class="rvo-checkbox rvo-checkbox--not-checked" for="${id(v.pad)}"><input id="${id(v.pad)}" ${naam} class="rvo-checkbox__input" type="checkbox" value="${esc(w)}">${esc(l)}</label></div>`;
      }
      return `<div class="rvo-radio-button__group">${opties.map(([w, l], i) =>
        `<label class="rvo-radio-button" for="${id(v.pad)}-${i}"><input id="${id(v.pad)}-${i}" ${naam} type="radio" class="utrecht-radio-button" value="${esc(w)}">${esc(l)}</label>`).join('')}</div>`;
    }
    case 'datum': return `<input type="date" id="${id(v.pad)}" ${naam} class="${textbox} utrecht-textbox--sm">`;
    case 'getal': return `<input type="number" inputmode="numeric" id="${id(v.pad)}" ${naam} class="${textbox} utrecht-textbox--xs">`;
    case 'bedrag': return `<div class="bedrag"><span aria-hidden="true">€</span><input type="number" inputmode="decimal" id="${id(v.pad)}" ${naam} class="${textbox} utrecht-textbox--sm"></div>`;
    case 'upload': return `<input type="file" id="${id(v.pad)}" ${naam} class="rvo-file-input">`;
    default: return v.meerregelig
      ? `<textarea rows="4" id="${id(v.pad)}" ${naam} class="utrecht-textarea utrecht-textarea--html-textarea"></textarea>`
      : `<input type="text" id="${id(v.pad)}" ${naam} class="${textbox} utrecht-textbox--md">`;
  }
}

// Een vraag als ROOS FormField: label, hulptekst, signalering (rvo-form-feedback) en invoer.
function veldHtml(v) {
  const tekst = t.velden?.[v.pad] ?? { label: `⚠ geen tekst voor ${v.pad}` };
  const s = schemaVoor(p.schema, v.pad) ?? {};
  const nieuw = oudePaden && !oudePaden.has(v.pad);
  const bronnen = (v.req ?? []).map((r) => `<span class="rvo-tag rvo-tag--info">${esc(r)} · ${esc(p.trace.eisen?.[r]?.bron ?? 'geen bron')}</span>`).join(' ');
  const attrs = [
    v.zichtbaarAls ? `data-zichtbaar-veld="${esc(v.zichtbaarAls.veld)}" data-zichtbaar-is="${esc(v.zichtbaarAls.is)}"` : '',
    v.signalering ? `data-onder="${esc(v.signalering.onder ?? '')}" data-boven="${esc(v.signalering.boven ?? '')}"` : '',
  ].join(' ');
  return `<div class="utrecht-form-field utrecht-form-field--text rvo-form-field${nieuw ? ' nieuw' : ''}" role="group" aria-labelledby="${id(v.pad)}-label" ${attrs}>
  <div class="rvo-form-field__label">
    <div class="rvo-layout-row rvo-layout-gap--sm"><label id="${id(v.pad)}-label" class="rvo-label" for="${id(v.pad)}">${esc(tekst.label)}</label>${nieuw ? '<span class="rvo-tag rvo-tag--success rvo-tag--pill">NIEUW</span>' : ''}</div>
    ${tekst.hulp ? `<div class="utrecht-form-field-description">${esc(tekst.hulp)}</div>` : ''}
    ${tekst.signalering ? `<div class="rvo-form-feedback rvo-form-feedback--warning signalering" hidden>${icoon('waarschuwing')}${esc(tekst.signalering)}</div>` : ''}
  </div>
  ${invoer(v, tekst, s)}
  <div class="bron">${bronnen}</div>
</div>`;
}

const stappen = p.wizard.stappen.map((stap, i) => `<section class="rvo-card rvo-card--outline rvo-card--padding-lg stap">
  <div class="rvo-card__content rvo-layout-column rvo-layout-gap--lg">
    <h2 class="utrecht-heading-2 rvo-heading">Stap ${i + 1}. ${esc(t.stappen?.[stap.id]?.titel ?? stap.id)}</h2>
    ${t.stappen?.[stap.id]?.intro ? `<p class="rvo-paragraph">${esc(t.stappen[stap.id].intro)}</p>` : ''}
    ${stap.velden.map(veldHtml).join('\n')}
  </div>
</section>`).join('\n');

const roos = 'node_modules/@nl-rvo';
const html = `<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(t.titel)}</title>
<link rel="stylesheet" href="${roos}/assets/fonts/index.css">
<link rel="stylesheet" href="${roos}/assets/icons/index.css">
<link rel="stylesheet" href="${roos}/design-tokens/dist/index.css">
<link rel="stylesheet" href="${roos}/component-library-css/dist/index.css">
<style>
/* Alleen wat ROOS niet zelf regelt: de demolabels en de opbouw van de pagina. */
body { margin:0; background:var(--rvo-color-grijs-050, #f8fafc); }
.kop { background:var(--rvo-color-hemelblauw, #01689b); color:#fff; padding:24px 16px; }
.kop h1 { color:#fff; margin:0; }
.kop p { color:#fff; margin:4px 0 0; }
.fictief { background:var(--rvo-color-rood-150, #f9dfdd); color:var(--rvo-color-grijs-900, #0f172a); text-align:center; font-weight:700; padding:6px 16px; }
main { padding-block:24px; }
.stap { background:#fff; margin-block-end:24px; }
.rvo-form-field.nieuw { outline:3px solid var(--rvo-color-groen, #39870c); outline-offset:12px; border-radius:2px; background:var(--rvo-color-groen-150, #e1eddb); }
.bedrag { display:flex; align-items:center; gap:8px; }
.bron { display:flex; flex-wrap:wrap; gap:4px; }
.meta { color:var(--rvo-color-grijs-700, #334155); font-size:.875rem; }
[hidden] { display:none !important; }
</style></head>
<body class="rvo-theme">
<div class="fictief">FICTIEF — deze regeling bestaat niet (demo)</div>
<div class="kop"><div class="rvo-max-width-layout rvo-max-width-layout--md rvo-max-width-layout-inline-padding--md">
  <h1 class="utrecht-heading-1 rvo-heading">${esc(t.titel)}</h1><p class="rvo-paragraph">${esc(t.intro)}</p>
</div></div>
<main class="rvo-max-width-layout rvo-max-width-layout--md rvo-max-width-layout-inline-padding--md">
<p class="rvo-paragraph meta">Pakketversie ${esc(p.versie.versie)} · gemaakt uit de bestanden in <code>pakket/</code> · het blauwe label onder een vraag = eis en artikel</p>
${stappen}
<button class="utrecht-button rvo-button rvo-button--primary rvo-button--size-md" type="button">Aanvraag indienen</button>
</main>
<script>
function waarde(naam) {
  for (const el of document.querySelectorAll('[name="' + naam + '"]'))
    if ((el.type === 'radio' || el.type === 'checkbox') ? el.checked : true) return el.value;
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
  document.querySelectorAll('.rvo-checkbox').forEach((l) => {
    const c = l.querySelector('input').checked;
    l.classList.toggle('rvo-checkbox--checked', c); l.classList.toggle('rvo-checkbox--not-checked', !c);
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
