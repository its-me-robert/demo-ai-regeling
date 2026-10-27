// Controle van het regelingpakket. Gebruik: npm run controleer
// Controleert of formulier, gegevensbeschrijving, teksten, voorbeelden en traceerbaarheid bij elkaar passen.
import { leesPakket, velden, schemaVoor, schemaPaden, isVerplicht } from './pakket.mjs';

const p = leesPakket();
const alleVelden = velden(p.wizard);
const resultaten = [];
const controle = (naam, fouten) => resultaten.push({ naam, fouten });

// 1. Elke vraag staat in de gegevensbeschrijving, en andersom.
{
  const fouten = [];
  const wizardPaden = new Set(alleVelden.map((v) => v.pad));
  for (const v of alleVelden) if (!schemaVoor(p.schema, v.pad)) fouten.push(`vraag "${v.pad}" staat niet in schema.json`);
  for (const pad of schemaPaden(p.schema)) if (!wizardPaden.has(pad)) fouten.push(`"${pad}" staat in schema.json maar niet in het formulier`);
  controle('Formulier en gegevensbeschrijving passen bij elkaar', fouten);
}

// 2. Elke vraag heeft een tekst, en een keuzevraag heeft alle opties.
{
  const fouten = [];
  for (const v of alleVelden) {
    const tekst = p.teksten.velden?.[v.pad];
    if (!tekst?.label) { fouten.push(`vraag "${v.pad}" heeft geen label in teksten.nl.yaml`); continue; }
    if (v.type === 'keuze') {
      const s = schemaVoor(p.schema, v.pad) ?? {};
      const waarden = s.enum ?? (s.const !== undefined ? [s.const] : s.type === 'boolean' ? [true, false] : []);
      for (const w of waarden) if (!tekst.opties?.[String(w)]) fouten.push(`keuzevraag "${v.pad}" mist de tekst voor optie "${w}"`);
    }
    if (v.signalering && !tekst.signalering) fouten.push(`vraag "${v.pad}" heeft een signalering maar geen signaleringstekst`);
  }
  for (const id of p.wizard.stappen.map((s) => s.id)) if (!p.teksten.stappen?.[id]?.titel) fouten.push(`stap "${id}" heeft geen titel`);
  controle('Elke vraag heeft een tekst', fouten);
}

// 3. Traceerbaarheid: vraag -> eis (REQ) -> artikel in de regeling.
{
  const fouten = [];
  const eisen = p.trace.eisen ?? {};
  for (const v of alleVelden) {
    if (!v.req?.length) fouten.push(`vraag "${v.pad}" hoort bij geen enkele eis (REQ)`);
    for (const r of v.req ?? []) if (!eisen[r]) fouten.push(`vraag "${v.pad}" verwijst naar onbekende eis ${r}`);
  }
  const artikelen = new Set([...p.regeling.matchAll(/^## (Artikel \d+)/gm)].map((m) => m[1]));
  for (const [id, eis] of Object.entries(eisen)) {
    const artikel = eis.bron?.match(/Artikel \d+/)?.[0];
    if (!artikel) fouten.push(`eis ${id} heeft geen bron (geen bron → geen eis)`);
    else if (!artikelen.has(artikel)) fouten.push(`eis ${id} verwijst naar ${artikel}, maar dat staat niet in de regeling`);
  }
  controle('Elke vraag is herleidbaar naar een artikel', fouten);
}

// 4. Aanvragers kunnen altijd indienen: een minimum of maximum is een signalering, geen blokkade.
{
  const fouten = [];
  for (const v of alleVelden) {
    const s = schemaVoor(p.schema, v.pad) ?? {};
    if (v.signalering?.onder !== undefined && s.minimum >= v.signalering.onder)
      fouten.push(`"${v.pad}": het minimum in schema.json blokkeert indienen; dat hoort een signalering te zijn`);
    if (v.signalering?.boven !== undefined && s.maximum <= v.signalering.boven)
      fouten.push(`"${v.pad}": het maximum in schema.json blokkeert indienen; dat hoort een signalering te zijn`);
    if (v.zichtbaarAls && isVerplicht(p.schema, v.pad))
      fouten.push(`"${v.pad}" is niet altijd zichtbaar, maar wel verplicht in schema.json`);
  }
  controle('Aanvragers kunnen altijd indienen', fouten);
}

// 5. Elke voorbeeldaanvraag past in de gegevensbeschrijving.
{
  const fouten = [];
  for (const vb of p.voorbeelden) for (const f of valideer(vb.data, p.schema, '')) fouten.push(`${vb.naam}: ${f}`);
  if (!p.voorbeelden.length) fouten.push('er is geen voorbeeldaanvraag');
  controle('Voorbeeldaanvragen zijn geldig', fouten);
}

// Uitkomst
let totaal = 0;
console.log(`\nControle pakket ${p.pakket.korteNaam}, versie ${p.versie.versie}\n`);
for (const r of resultaten) {
  console.log(`${r.fouten.length ? '❌' : '✅'} ${r.naam}`);
  for (const f of r.fouten) console.log(`     - ${f}`);
  totaal += r.fouten.length;
}
console.log(totaal ? `\n❌ ${totaal} fout(en) gevonden.\n` : `\n✅ Alles in orde (${resultaten.length} controles).\n`);
process.exit(totaal ? 1 : 0);

// Kleine validator voor het deel van JSON Schema dat dit pakket gebruikt.
function valideer(waarde, s, pad) {
  const naam = pad || '(aanvraag)';
  const fouten = [];
  if (s.const !== undefined && waarde !== s.const) fouten.push(`${naam} moet ${JSON.stringify(s.const)} zijn`);
  if (s.enum && !s.enum.includes(waarde)) fouten.push(`${naam} heeft een onbekende waarde "${waarde}"`);
  const type = Array.isArray(waarde) ? 'array' : typeof waarde;
  if (s.type === 'object') {
    if (type !== 'object' || waarde === null) return [`${naam} moet een object zijn`];
    for (const r of s.required ?? []) if (waarde[r] === undefined) fouten.push(`${pad ? pad + '.' : ''}${r} ontbreekt`);
    for (const [k, v] of Object.entries(waarde)) {
      const sub = s.properties?.[k];
      if (!sub) fouten.push(`${pad ? pad + '.' : ''}${k} staat niet in schema.json`);
      else fouten.push(...valideer(v, sub, pad ? `${pad}.${k}` : k));
    }
    return fouten;
  }
  if (s.type === 'string') {
    if (type !== 'string') return [`${naam} moet tekst zijn`];
    if (s.minLength !== undefined && waarde.length < s.minLength) fouten.push(`${naam} is te kort`);
    if (s.maxLength !== undefined && waarde.length > s.maxLength) fouten.push(`${naam} is te lang`);
    if (s.pattern && !new RegExp(s.pattern).test(waarde)) fouten.push(`${naam} heeft niet de goede vorm`);
  }
  if (s.type === 'integer' && !Number.isInteger(waarde)) return [`${naam} moet een geheel getal zijn`];
  if (s.type === 'number' && type !== 'number') return [`${naam} moet een getal zijn`];
  if (s.type === 'boolean' && type !== 'boolean') return [`${naam} moet ja of nee zijn`];
  if (s.minimum !== undefined && waarde < s.minimum) fouten.push(`${naam} is kleiner dan ${s.minimum}`);
  if (s.maximum !== undefined && waarde > s.maximum) fouten.push(`${naam} is groter dan ${s.maximum}`);
  if (s.exclusiveMinimum !== undefined && waarde <= s.exclusiveMinimum) fouten.push(`${naam} moet groter zijn dan ${s.exclusiveMinimum}`);
  return fouten;
}
