@echo off
chcp 65001 > nul
title Gerador da Bíblia — Teologia Ninja

echo.
echo ================================================
echo   GERADOR DO ANTIGO TESTAMENTO HEBRAICO
echo ================================================
echo.
echo 1 - Gerar um livro
echo 2 - Gerar todo o Antigo Testamento
echo 3 - Listar livros
echo 4 - Inspecionar base
echo 5 - Sair
echo.

set /p opcao=Escolha uma opcao: 

if "%opcao%"=="1" goto livro
if "%opcao%"=="2" goto todos
if "%opcao%"=="3" goto listar
if "%opcao%"=="4" goto inspecionar
if "%opcao%"=="5" exit

echo Opcao invalida.
pause
exit /b

:livro
echo.
set /p idlivro=Digite o id do livro, exemplo genesis: 
php gerar-json-hebraico.php %idlivro%
echo.
pause
exit /b

:todos
echo.
php gerar-json-hebraico.php --todos
echo.
pause
exit /b

:listar
echo.
php gerar-json-hebraico.php --listar
echo.
pause
exit /b

:inspecionar
echo.
php gerar-json-hebraico.php --inspecionar
echo.
pause
exit /b