source ~/.nvm/nvm.sh
nvm install "v$TRAVIS_NODE_VERSION"
nvm use "v$TRAVIS_NODE_VERSION"
nvm alias default "v$TRAVIS_NODE_VERSION"
echo `npm -v`
echo `node -v`
npm install
npm run build
npm run build:examples
