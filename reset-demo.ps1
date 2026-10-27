# Zet de demo terug naar de beginstand, zodat je hem opnieuw kunt doen.
# Gebruik (in de map demo-ai-regeling):  powershell -ExecutionPolicy Bypass -File .\reset-demo.ps1
#
# - sluit open demo-PR's (branches wv-*) en verwijdert die branches, lokaal en op GitHub
# - zet main terug naar de tag "beginstand" (ook op GitHub, als die verschilt)
# - verwijdert niet-vastgelegde bestanden (behalve node_modules) en maakt het formulier opnieuw
# De branch "voorbeeld-uitkomst" (het vangnet) blijft staan.

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

Write-Host "Open demo-PR's sluiten..."
$prs = gh pr list --state open --json number,headRefName | ConvertFrom-Json
foreach ($pr in $prs) {
  if ($pr.headRefName -like 'wv-*') {
    gh pr close $pr.number --delete-branch --comment "Demo gereset." | Out-Null
    Write-Host "  PR #$($pr.number) gesloten ($($pr.headRefName))"
  }
}

Write-Host "Terug naar main op de beginstand..."
git checkout --quiet --force main
git reset --quiet --hard beginstand
git clean -fdq

git fetch --quiet --prune origin
$remote = git rev-parse origin/main
$begin = git rev-parse 'beginstand^{commit}'
if ($remote -ne $begin) {
  git push --quiet --force origin "beginstand^{commit}:refs/heads/main"
  Write-Host "  main op GitHub teruggezet"
}

foreach ($b in (git for-each-ref --format='%(refname:short)' refs/heads/wv-*)) {
  git branch -D $b | Out-Null
  Write-Host "  lokale branch $b verwijderd"
}
foreach ($b in (git for-each-ref --format='%(refname:lstrip=3)' refs/remotes/origin/wv-*)) {
  git push --quiet origin --delete $b
  Write-Host "  branch $b op GitHub verwijderd"
}

npm run --silent formulier | Out-Null
Write-Host ""
Write-Host "Klaar: beginstand. Start een NIEUWE Claude-sessie voor de volgende run."
