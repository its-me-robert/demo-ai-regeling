# Demoscript: ontwikkelen met AI (~15 min)

**De boodschap:** de AI doet het werk, maar volgt de afspraken van het team (CLAUDE.md), stelt vragen in plaats van te gokken, laat zich controleren door een tweede AI en door een test, en levert een voorstel op dat de mens beoordeelt. Alles is herleidbaar.

## Vooraf (5 min voor de start)
1. `powershell -ExecutionPolicy Bypass -File .\reset-demo.ps1`: beginstand.
2. Open de map `C:\git\demo-ai-regeling` in VS Code (of in de desktop-app: Code-tab, map kiezen) en start een **nieuwe** Claude-sessie. De eerste keer vraagt Claude of je de map **vertrouwt**: zeg ja, anders gelden de toestemmingen uit `.claude/settings.json` niet. Doe dat bij het oefenen, niet live.
3. Open `formulier.html` in de browser (`npm.cmd run formulier:open`; in PowerShell werkt `npm` zonder `.cmd` alleen als scripts zijn toegestaan) en `wijzigingsverzoeken/WV-001-vrijwilligers.md` in VS Code. Zet een tab klaar met de repo op GitHub.
4. Lettergrootte omhoog. Meldingen uit.

## 1. De beginstand (2 min)
- **Formulier in de browser:** "Dit ziet een aanvrager. Fictieve regeling, echt formaat: hetzelfde pakketformaat als DEI+." Wijs op de grijze regel onder elke vraag: "elke vraag hoort bij een artikel uit de regeling".
- **Laat de map zien:** `regeling/` (de bron), `pakket/` (wat het formulier maakt), `CLAUDE.md` (de afspraken van ons team voor de AI), `.claude/skills` (het werkproces), `.claude/agents` (de kritische collega).
- Open **CLAUDE.md**: "Dit is als een inwerkdocument voor een nieuwe collega. Regel 1: geen bron, geen eis. Regel 2: aanvragers kunnen altijd indienen."

## 2. Het wijzigingsverzoek (1 min)
Open **WV-001**: de PO wil een vraag naar het aantal vrijwilligers, **minimaal 2, anders niet indienen**.
"Let op: daar zit iets in wat niet mag. Kijken of de AI het ziet."

## 3. De prompt (typ live)
```
/vraag-toevoegen WV-001. Laat de wijziging reviewen door de agent pakket-controleur.
```
"Ik kies expliciet de skill (het werkproces) en de agent (de reviewer), zodat we zeker weten welke afspraken hij volgt."

## 4. Impact en de vraag van de skill (3 min)
- **Impacttabel:** "Eén vraag raakt 6 bestanden. Ook dat `mapping.yaml` *niet* verandert, is een bewuste conclusie."
- **De skill stelt vragen** (meerkeuze):
  - *Bron:* hij stelt zelf artikel 6 lid 2 voor. → **Kies het voorstel.**
  - *Minimum van 2:* in strijd met huisregel 2, en de regeling eist het niet. → **Kies: signalering.**
- "Dit is het belangrijkste moment: de AI gokt niet en voert het verzoek niet blind uit. Hij legt het besluit bij de mens."
- **Plan, dan akkoord.** → **Akkoord, bouwen.**

## 5. Bouwen en controleren (2 min)
- Er worden bestanden gewijzigd; de controle draait en wordt **groen**.
- Het formulier gaat open: de nieuwe vraag is **groen gemarkeerd (NIEUW)**. Typ `1` → de gele **signalering** verschijnt, maar indienen blijft mogelijk.

## 6. De review door de agent (2 min)
"Nu kijkt een tweede AI, met een frisse blik en alleen-lezen rechten. Zoals het vier-ogenprincipe."
Bespreek de tabel met bevindingen. Komt er een vraag over een laag-bevinding? → **Meenemen.**

## 7. De pull request (3 min)
- Claude **vraagt toestemming** voor `git push` en `gh pr create`: "De AI mag lokaal werken, maar naar buiten gaan doet hij niet zonder mij."
- Open de PR op GitHub en bekijk samen:
  - **Beschrijving:** het verzoek, de impact, **de keuzes van de mens**, de traceerbaarheid (vraag → REQ → artikel), de controle en de review.
  - **Files changed:** kleine, leesbare diff.
  - **`ai-sessies/`:** het ruwe transcript: "Elke stap, elke vraag en elke toestemming is na te lezen. Over een jaar kan een auditor zien waarom deze vraag erin kwam."
- "Mergen doet de AI niet. Dat doen wij, na review."

## Als het hapert
- Duurt het te lang of loopt het vast: laat de branch **`voorbeeld-uitkomst`** zien en de PR van de proefrun op GitHub.
- Vraagt Claude onverwacht toestemming: lees voor wat hij wil doen, en geef het (dat laat ook iets zien).
- Na afloop of tussen oefenrondes: `reset-demo.ps1`, en daarna een **nieuwe** sessie.

## Vragen die je kunt verwachten
- *"Weet de AI dat zelf?"* Nee. Dat staat in CLAUDE.md en in de skill. Die schrijft en onderhoudt het team zelf, en dat is ons vakmanschap.
- *"En als hij het mis heeft?"* Dan vangen de controle, de reviewagent en de menselijke review van de PR het op. Elke laag is zichtbaar.
- *"Is dit echt?"* Het pakketformaat en de werkwijze komen uit ons platformproject. De regeling is fictief.
