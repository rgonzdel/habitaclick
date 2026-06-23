@echo off
echo Iniciando HabitaClick...
cd /d "C:\Users\34645\inmobiliaria-saas"
pm2 start ecosystem.config.js
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:3001
echo.
echo Para ver estado: pm2 ls
echo Para parar todo: pm2 stop all
pause
