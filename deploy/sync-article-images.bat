@echo off
REM Uruchom z dowolnego miejsca — nie wymaga cd na dysk D:
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0sync-article-images.ps1" %*
