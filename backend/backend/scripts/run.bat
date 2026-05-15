@echo off
REM Wrapper script for Windows to run Python scripts with correct environment

cd /d "%~dp0..\.."

REM Activate venv if exists
if exist .venv\Scripts\activate.bat (
    call .venv\Scripts\activate.bat
)

REM Run the script
python %*
