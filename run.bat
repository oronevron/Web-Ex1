cd %~dp0

@echo *** Start mongo db server ***
start cmd /k "C:\Program Files\MongoDB\Server\3.4\bin\mongod.exe" --dbpath mongoDb_Data

timeout 5
@echo *** Start node server ***
start cmd /k node server\server.js

timeout 5
start chrome.exe "http://localhost:8080/index.html"

@PAUSE