set -ex
export CHROME_BIN=chromium-browser
export DISPLAY=:99.0
sh -e /etc/init.d/xvfb start
cd jupyter-js-widgets
npm run test:unit:$BROWSER && npm run test:examples:$BROWSER
