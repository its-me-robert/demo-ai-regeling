// Leest het regelingpakket in. Gedeeld door controleer.mjs en maak-formulier.mjs.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lees = (pad) => readFileSync(join(root, pad), 'utf8');
const yaml = (pad) => parse(lees(pad));

export function leesPakket() {
  const voorbeeldMap = 'pakket/voorbeelden';
  return {
    pakket: yaml('pakket/pakket.yaml'),
    versie: yaml('pakket/versie.yaml'),
    wizard: yaml('pakket/aanvraag/wizard.yaml'),
    schema: JSON.parse(lees('pakket/aanvraag/schema.json')),
    teksten: yaml('pakket/aanvraag/teksten.nl.yaml'),
    trace: yaml('pakket/traceerbaarheid.yaml'),
    regeling: lees('regeling/regeling.md'),
    voorbeelden: readdirSync(join(root, voorbeeldMap))
      .filter((f) => f.endsWith('.json'))
      .map((f) => ({ naam: f, data: JSON.parse(lees(`${voorbeeldMap}/${f}`)) })),
  };
}

// Alle vragen uit het formulier, met de stap waarin ze staan.
export const velden = (wizard) =>
  wizard.stappen.flatMap((stap) => stap.velden.map((veld) => ({ ...veld, stap: stap.id })));

// Het deel van de gegevensbeschrijving bij een pad als "activiteit.titel".
export function schemaVoor(schema, pad) {
  let node = schema;
  for (const deel of pad.split('.')) {
    node = node?.properties?.[deel];
    if (!node) return undefined;
  }
  return node;
}

// Is het veld verplicht in de gegevensbeschrijving?
export function isVerplicht(schema, pad) {
  const delen = pad.split('.');
  const ouder = delen.length === 1 ? schema : schemaVoor(schema, delen.slice(0, -1).join('.'));
  return (ouder?.required ?? []).includes(delen.at(-1));
}

// Alle eindvelden in de gegevensbeschrijving, als paden.
export function schemaPaden(node, prefix = '') {
  return Object.entries(node.properties ?? {}).flatMap(([naam, sub]) => {
    const pad = prefix ? `${prefix}.${naam}` : naam;
    return sub.properties ? schemaPaden(sub, pad) : [pad];
  });
}
