curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | bash
source /home/docs/.profile
nvm install 5
nvm use 5
nvm alias default 5
npm install -g npm
bash build-local.sh
