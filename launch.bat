@echo off
cd /d %~dp0
py launcher.py
if %ERRORLEVEL% neq 0 python launcher.py
