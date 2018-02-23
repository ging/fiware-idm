## How to install

```
sudo apt-get update
sudo apt-get install mysql-server

mysql -u host -u root -p // To access mysql client
create database idm; // To create a new database

git clone https://github.com/ging/mesias.git
npm install
cp config.js.template config.js

// Create database, run migrations and seeders
npm run-script create_db
npm run-script migrate_db 
npm run-script seed_db 

Generate certificates for https (not needed for development in http)
./generate_openssl_keys.sh
```

## How to run

```
npm start
```