<#
.SYNOPSIS
  Build the web app, regenerate Android launcher icons from public/favicon.png, sync Capacitor, then open Android Studio.

.DESCRIPTION
  Single source for the store/launcher icon: public/favicon.png (same neon U·house mark as the site).
  Uses @capacitor/assets to write mipmap/drawable resources Android Studio picks up from the manifest.
#>

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "==> npm run build" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "==> Copy brand icon to assets/logo.png for Capacitor Assets" -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "assets" | Out-Null
if (-not (Test-Path "public\favicon.png")) {
    Write-Host "Missing public\favicon.png — add your icon there first." -ForegroundColor Red
    exit 1
}
Copy-Item -Path "public\favicon.png" -Destination "assets\logo.png" -Force

Write-Host "==> npm run android:icons (mipmap + adaptive icon)" -ForegroundColor Cyan
npm run android:icons
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "==> npm run android:sync" -ForegroundColor Cyan
npm run android:sync
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Done. Open the android folder in Android Studio and Build > Build Bundle(s) / APK(s)." -ForegroundColor Green
