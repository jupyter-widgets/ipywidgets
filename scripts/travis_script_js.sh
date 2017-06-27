set -ex
export CHROME_BIN=chromium-browser
export DISPLAY=:99.0
source ~/.nvm/nvm.sh
nvm use "v$TRAVIS_NODE_VERSION"
nvm alias default "v$TRAVIS_NODE_VERSION"
sh -e /etc/init.d/xvfb start

cd packages/base
npm run test:unit:$BROWSER
cd ..

cd packages/controls
npm run test:unit:$BROWSER
cd ..

cd packages/html-manager
npm run test:unit:$BROWSER
cd ..

cd examples/web1
npm run test:firefox
cd ../../
