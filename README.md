## How to install

```
sudo apt-get update
sudo apt-get install mysql-server

mysql -u host -u root -p // To access mysql client
create database idm; // To create a new database

git clone https://github.com/ging/mesias.git
npm install
cp config.js.template config.js

Generate certificates for https
./commands_to_generate_keys.sh
```

## How to run

```
npm start
```