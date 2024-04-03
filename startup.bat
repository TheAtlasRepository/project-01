@echo off

::Place this file in the root folder of the project

set condapath=C:\%homepath%\miniconda3\Scripts\activate.bat
set envname=ImgPDF2Map
set repopath=.

type boot_utilities\logo.txt
echo:

rem Check if conda is system installation or user installation
if exist %condapath% (
    echo Conda found in user directory
) else if exist C:\programdata\miniconda3 (
    set condapath=C:\programdata\miniconda3\Scripts\activate.bat
    echo Conda found in system directory
) else (
    echo Conda not found
    exit /b
)

rem Check if front and backend folders exists
if not exist %repopath%\frontend (
    echo Frontend folder not found
    exit /b
)
if not exist %repopath%\backend (
    echo Backend folder not found
    exit /b
)
rem Check if .env.local file exists
if not exist %repopath%\frontend\.env.local (
    call boot_utilities\create_env.bat
)

rem Try to start conda base environment
call %condapath% base
if %errorlevel% equ 0 (
    echo Conda base environment is now active.
) else (
    echo Conda base environment could not be activated/start or does not exist.
    exit /b
)

rem Check if Conda environment exists
call conda info --envs | findstr /i "\<%envname%\>" > nul
if %errorlevel% equ 0 (
    rem Environment exists, activate it
    echo Activating existing Conda environment: %envname%
    call %condapath% %envname%
) else (
    rem Environment doesn't exist, create and activate it
    echo Creating and activating new Conda environment: %envname%
    call conda create --name %envname% python=3.8
    call conda activate %envname%
    call conda install -q --yes yarn
    call conda install -q --yes pip
    call conda install -q --yes -c conda-forge poppler
)
echo Conda environment %envname% is now active.

rem Start frontend and backend in seperate cmd windows
start cmd /k "cd %repopath%\backend && pip install --quiet -r requirements.txt && pip install -e . -U && python main.py --port 8000"
start cmd /k "cd %repopath%\frontend && yarn install -s && yarn dev"

rem Check if server is running every second if not successfull after 20 seconds exit, if successfull open browser
setlocal
set /a count=0
:loop
timeout /t 1 >nul
set /a count+=1
curl -s http://localhost:3000 >nul
if %errorlevel% equ 0 (
    start "" http://localhost:8000/docs
    start "" http://localhost:3000
    exit /b
) else if %count% geq 20 (
    echo Server could not be started
    exit /b
) else (
    goto loop
)