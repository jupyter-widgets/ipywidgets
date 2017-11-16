set -ex
export CHROME_BIN=chromium-browser
export DISPLAY=:99.0
sh -e /etc/init.d/xvfb start

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
