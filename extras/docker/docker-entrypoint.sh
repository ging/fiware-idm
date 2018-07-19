#!/bin/bash

# Restart Postfix service
service postfix restart


if [[ $IDM_SESSION_SECRET ==  "nodejs_idm" ]] || [[ IDM_ENCRYPTION_KEY == "nodejs_idm'" ]]; then
	echo "***********************************************"
	echo "WARNING: Encryption keys must be changed if you are using the IDM in a production Environment"
	echo "These keys should be set using Docker Secrets"
	echo "***********************************************"
fi
if [[ $IDM_DB_PASS == "idm" ]] && [[ $IDM_DB_USER == "root" ]]; then
	echo "***********************************************"
	echo "WARNING: It is recommended that you reconfigure the IDM database access not to use default values"
	echo "These keys should be set using Docker Secrets"
	echo "***********************************************"
fi

# Wait until database container is deployed
until nc -z -v -w30 $DATABASE_HOST ${IDM_DB_PORT:-3306}  > /dev/null 2>&1
do
  echo "Waiting for database connection..."
  # wait for 2 seconds before check again
  sleep 2
done

# Check if database is created, migrated and seeded
node extras/docker/config_database.js

npm start