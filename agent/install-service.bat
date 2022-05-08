@echo off
if "%1"=="runas" (
  cd %~dp0
  echo Opening nssm dialogue

  nssm install mqtrolagent

) else (
  powershell Start -File "cmd '/K %~f0 runas'" -Verb RunAs
)