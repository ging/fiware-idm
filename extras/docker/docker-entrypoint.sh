#!/bin/bash

./generate_openssl_keys.sh

until nc -z -v -w30 mysql 3306
do
  echo "Waiting for database connection..."
  # wait for 2 seconds before check again
  sleep 2
done

npm run create_db
npm run migrate_db
npm run seed_db

sudo npm start