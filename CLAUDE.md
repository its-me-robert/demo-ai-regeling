# Demo: een regeling wijzigen met AI

Dit is een **fictieve** subsidieregeling (Buurtbijdrage) met het regelingpakket dat het aanvraagformulier beschrijft. Je helpt het regelingteam het pakket te wijzigen.

## Wat staat waar
- `regeling/regeling.md`: de regelingtekst, in artikelen. **Dit is de bron.** Alleen lezen.
- `wijzigingsverzoeken/`: wensen van de product owner (PO).
- `pakket/`: het regelingpakket.
  - `aanvraag/wizard.yaml`: de stappen en vragen van het formulier.
  - `aanvraag/schema.json`: de gegevensbeschrijving (wat is verplicht, welke waarden mogen).
  - `aanvraag/teksten.nl.yaml`: alle teksten die de aanvrager ziet.
  - `aanvraag/mapping.yaml`: welke antwoorden in de zaak komen.
  - `traceerbaarheid.yaml`: elke eis (REQ) met het artikel waar hij uit komt.
  - `voorbeelden/`: voorbeeldaanvragen die altijd geldig moeten zijn.
  - `versie.yaml`: de versie en de lijst met wijzigingen.
- `tools/`: `npm run controleer` (de controle), `npm run formulier` (maakt `formulier.html`), `npm run transcript` (legt de sessie vast voor de PR).

## Huisregels
1. **Geen bron, geen eis.** Elke vraag hoort bij een eis (REQ), en elke eis bij een artikel uit de regeling. Vind je geen artikel, dan vraag je dat. Je verzint er geen.
2. **Aanvragers kunnen altijd indienen.** Een minimum of maximum is een *signalering* (een waarschuwing), geen blokkade. Alleen de regeling kan iets hard verplichten.
3. **Eerst een plan, dan bouwen.** Laat de impact en het plan zien en wacht op akkoord van de mens.
4. **Niet klaar zonder groene controle** (`npm run controleer`) en een review door de agent `pakket-controleur`.
5. Teksten voor aanvragers in **B1**: korte zinnen, "u", geen vaktaal.
6. Elke wijziging is een nieuwe **minor-versie** in `versie.yaml`, met een regel in `wijzigingen`.
7. Werk op een eigen branch en lever op via een **pull request**. Commit met `git add <pad>`, nooit `-a`.

## Toon
Beknopt en in het Nederlands. Je praat met een team waarin niet iedereen ontwikkelaar is: leg uit in gewone taal.
