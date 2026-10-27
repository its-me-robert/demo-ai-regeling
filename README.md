# Demo: een regeling wijzigen met AI

Een kleine, volledige Claude Code-opzet om te laten zien hoe je met AI aan een regelingpakket werkt. De regeling (**Buurtbijdrage**) is **fictief**.

| Onderdeel | Wat |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | De afspraken van het team voor de AI |
| [`.claude/skills/vraag-toevoegen`](.claude/skills/vraag-toevoegen/SKILL.md) | Het werkproces: impact → vragen → plan → bouwen → controle → review → PR |
| [`.claude/agents/pakket-controleur`](.claude/agents/pakket-controleur.md) | De kritische collega: een onafhankelijke review, alleen lezen |
| [`.claude/settings.json`](.claude/settings.json) | Wat de AI zonder vragen mag (lezen, pakket wijzigen, controle) en wat niet (pushen, de regeling wijzigen, mergen) |
| [`regeling/`](regeling/regeling.md) | De regelingtekst: de bron |
| [`pakket/`](pakket/) | Het regelingpakket: formulier, gegevens, teksten, traceerbaarheid |
| [`wijzigingsverzoeken/`](wijzigingsverzoeken/) | Wensen van de PO |
| [`ai-sessies/`](ai-sessies/README.md) | Ruwe AI-transcripten per PR |
| [`demoscript.md`](demoscript.md) | Het draaiboek voor de demo |

## Starten
Vereist: Node 24 (LTS), git, de GitHub-CLI (`gh`), Claude Code (VS Code-extensie, desktop-app of CLI).
In PowerShell: gebruik `npm.cmd` (of sta scripts toe met `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`).

```
npm.cmd ci
npm.cmd run controleer
npm.cmd run formulier:open
```

## Opnieuw beginnen
```
powershell -ExecutionPolicy Bypass -File .\reset-demo.ps1
```
Daarna een nieuwe Claude-sessie starten. De branch `voorbeeld-uitkomst` bevat een eerdere geslaagde run.
