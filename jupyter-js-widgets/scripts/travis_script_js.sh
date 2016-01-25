export CHROME_BIN=chromium-browser
export DISPLAY=:99.0
sh -e /etc/init.d/xvfb start
cd ipywidgets
npm run test:$BROWSER
