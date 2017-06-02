source ~/.nvm/nvm.sh
nvm install "v$TRAVIS_NODE_VERSION"
nvm use "v$TRAVIS_NODE_VERSION"
nvm alias default "v$TRAVIS_NODE_VERSION"
npm update -g npm
echo `npm -v`
echo `node -v`
cd jupyter-widgets-controls
npm install
