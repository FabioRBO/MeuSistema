@echo off
chcp 65001 > nul
title Gerador da Bíblia — Teologia Ninja

echo.
echo ================================================
echo   GERADOR DO NOVO TESTAMENTO GREGO
echo ================================================
echo.
echo 1 - Gerar um livro
echo 2 - Gerar todo o Novo Testamento
echo 3 - Listar livros
echo 4 - Sair
echo.

set /p opcao=Escolha uma opcao: 

if "%opcao%"=="1" goto livro
if "%opcao%"=="2" goto todos
if "%opcao%"=="3" goto listar
if "%opcao%"=="4" exit

echo Opcao invalida.
pause
exit /b

:livro
echo.
set /p idlivro=Digite o id do livro, exemplo 2-pedro: 
php gerar-json.php %idlivro%
echo.
pause
exit /b

:todos
echo.
php gerar-json.php --todos
echo.
pause
exit /b

:listar
echo.
php gerar-json.php --listar
echo.
pause
exit /b
