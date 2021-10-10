cd "../frontend"
yarn build

cd "../backend"

if [ -d "./dist" ]; then
    rm -r "./dist"
fi

cp -r "../frontend/dist" "./dist"
cd "./dist"
mv "./index.html" "./page.html"