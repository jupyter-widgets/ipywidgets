set -ex
export CHROME_BIN=chromium-browser

yarn run integrity

cd packages

cd base
yarn run test:unit:$BROWSER
cd ..

cd controls
yarn run test:unit:$BROWSER
cd ..

cd html-manager
yarn run test:unit:$BROWSER
cd ..
cd ..

cd examples/web1
yarn run test:firefox
cd ../..
