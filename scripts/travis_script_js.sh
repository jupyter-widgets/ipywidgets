set -ex
export CHROME_BIN=chromium-browser

jlpm run integrity

cd packages

cd base
jlpm run test:unit:$BROWSER
cd ..

cd controls
jlpm run test:unit:$BROWSER
cd ..

cd html-manager
jlpm run test:unit:$BROWSER
cd ..
cd ..

cd examples/web1
jlpm run test:firefox
cd ../..
