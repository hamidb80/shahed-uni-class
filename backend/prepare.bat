@REM build the front and copies the built filed into backned's dist folder

call cd "../frontend "
call yarn.cmd build

call cd "../backend"

call rmdir /s /q "./dist"
call echo D | xcopy /E "../frontend/dist" "./dist"
cd "./dist"
call ren "index.html" "page.html"