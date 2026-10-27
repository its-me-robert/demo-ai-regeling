---
name: vraag-toevoegen
description: Voegt een nieuwe vraag toe aan het aanvraagformulier van de regeling op basis van een wijzigingsverzoek - impactanalyse, vragen bij twijfel, plan, wijzigen, controleren, review door pakket-controleur en een pull request met het transcript. Gebruik als iemand een vraag aan het formulier wil toevoegen of een wijzigingsverzoek (WV) uitvoert.
argument-hint: "<wijzigingsverzoek, bv. WV-001>"
---

# Vraag toevoegen

Je voert een wijzigingsverzoek uit: één nieuwe vraag in het aanvraagformulier. Volg de stappen precies. Zeg bij elke stap in één regel welke stap het is, bijvoorbeeld **Stap 1 van 6: impact**.

## Stap 1: lezen en impact
Lees het wijzigingsverzoek (`wijzigingsverzoeken/<WV>*.md`), `regeling/regeling.md`, en alle bestanden in `pakket/`.

Laat een **impacttabel** zien met alle bestanden in `pakket/`, ook de bestanden die niet veranderen:

| Bestand | Wat verandert | Waarom |
|---|---|---|

Vermeld ook: de nieuwe pakketversie, en of er een nieuwe eis (REQ) nodig is.

## Stap 2: toetsen aan de bron en de huisregels
Leg het verzoek naast de regeling en de huisregels in `CLAUDE.md`. Zoek in elk geval:
- **Bron:** welk artikel is de grondslag voor deze vraag? Noem het artikel dat je denkt te zien, met het citaat.
- **Strijdigheid:** vraagt het verzoek iets wat de regeling of de huisregels niet toestaan (bijvoorbeeld een harde blokkade)?

Stel je vragen met de tool **AskUserQuestion**, alle vragen in één keer, met jouw voorstel als eerste optie. Ga niet verder tot de mens heeft geantwoord. Verzin nooit zelf een bron.

## Stap 3: plan en akkoord
Geef het plan in hooguit 6 regels: per bestand wat je doet, met de antwoorden uit stap 2 verwerkt. Vraag akkoord met AskUserQuestion ("Akkoord, bouwen" / "Aanpassen"). Ga pas verder na akkoord.

## Stap 4: bouwen en controleren
1. Maak een branch `wv-<nummer>-<kort-onderwerp>` (bv. `wv-001-vrijwilligers`) vanaf `main`.
2. Wijzig de bestanden. Volg het patroon van bestaande vragen: een signalering gaat zoals bij `gevraagdBedrag`.
3. Werk de voorbeeldaanvraag bij, zodat die geldig blijft.
4. Verhoog de versie in `versie.yaml` (minor) en voeg een regel toe aan `wijzigingen`, met het WV-nummer.
5. Draai `npm run controleer`. Is iets rood, herstel het en draai opnieuw. Laat de uitkomst zien.
6. Draai `npm run formulier:open`, zodat de mens het nieuwe formulier ziet. De nieuwe vraag is groen gemarkeerd.

## Stap 5: review
Start de subagent **pakket-controleur** (Agent-tool) met: het WV-nummer, de antwoorden uit stap 2 en de opdracht om `git diff main` te reviewen. Laat zijn bevindingen in een tabel zien.
- Herstel bevindingen met ernst *hoog* direct en draai de controle opnieuw.
- Bij *laag*: vraag de mens of je ze meeneemt.

## Stap 6: pull request
1. Commit de wijzigingen met `git add <pad>` per bestand, met als bericht `WV-<nummer>: <onderwerp>`.
2. Draai `npm run transcript` en commit `ai-sessies/<branch>/` in een tweede commit: `WV-<nummer>: transcript van de AI-sessie`.
3. Push de branch en maak de PR met `gh pr create --base main`. Schrijf de beschrijving naar een bestand in de tijdelijke map en geef dat mee met `--body-file`. Inhoud:
   - **Wijzigingsverzoek:** link naar het WV-bestand en een samenvatting in 1 zin.
   - **Wat is er veranderd:** de impacttabel van stap 1, bijgewerkt.
   - **Keuzes van de mens:** de vragen uit stap 2 met de antwoorden. Daarbij: "besloten door de mens, voorgesteld door AI".
   - **Traceerbaarheid:** vraag → REQ → artikel, als regel.
   - **Controle:** de uitkomst van `npm run controleer`.
   - **Review door pakket-controleur:** de bevindingen en wat ermee is gedaan.
   - **AI-sessie:** link naar het transcript in `ai-sessies/<branch>/`, met de vermelding dat het onbewerkt is, gescand op geheimen, en dat de laatste beurten ontbreken.
4. Geef de link naar de PR. Merge niet: de mens beoordeelt de PR.
