@echo off
REM Arquivo a executar
set "SCRIPT=%~dp0build\index.js"

REM Verifica se o Node está no PATH
where node >nul 2>&1 || (
  echo ERRO: Node.js não encontrado no PATH.
  goto :PAUSE_EXIT
)

REM Verifica se o build/index.js existe
if exist "%SCRIPT%" (
  echo Executando "%SCRIPT%"...
  node "%SCRIPT%"
  goto :EOF
) else (
  echo ERRO: Arquivo "%SCRIPT%" não encontrado.
)

:PAUSE_EXIT
echo.
echo Pressione qualquer tecla para sair...
pause >nul
