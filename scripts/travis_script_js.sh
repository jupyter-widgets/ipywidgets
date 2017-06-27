set -ex
export CHROME_BIN=chromium-browser
export DISPLAY=:99.0
source ~/.nvm/nvm.sh
nvm use "v$TRAVIS_NODE_VERSION"
nvm alias default "v$TRAVIS_NODE_VERSION"
sh -e /etc/init.d/xvfb start

cd jupyter-widgets-base
npm run test:unit:$BROWSER
cd ..

cd jupyter-widgets-controls
npm run test:unit:$BROWSER
cd ..

cd jupyter-widgets-htmlmanager
npm run test:unit:$BROWSER
cd ..

cd examples/web1
npm run test:firefox
cd ../../
