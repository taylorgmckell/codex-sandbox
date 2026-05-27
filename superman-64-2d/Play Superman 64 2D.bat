@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>nul
if %errorlevel%==0 (
  start "Superman 64 2D Server" cmd /k py -m http.server 8000
  goto open_game
)

where python >nul 2>nul
if %errorlevel%==0 (
  start "Superman 64 2D Server" cmd /k python -m http.server 8000
  goto open_game
)

echo Python was not found on this computer.
echo Ask me and I can help you install it.
pause
exit /b 1

:open_game
timeout /t 2 /nobreak >nul
start "" http://localhost:8000/
