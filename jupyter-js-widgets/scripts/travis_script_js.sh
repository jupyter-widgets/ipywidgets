set -ex
export CHROME_BIN=chromium-browser
export DISPLAY=:99.0
source ~/.nvm/nvm.sh
nvm use "v$TRAVIS_NODE_VERSION"
nvm alias default "v$TRAVIS_NODE_VERSION"
sh -e /etc/init.d/xvfb start
cd jupyter-js-widgets
npm run test:unit:$BROWSER && npm run test:examples:$BROWSER
