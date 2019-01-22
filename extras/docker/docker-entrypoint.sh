#!/bin/bash

# Restart Postfix service
service postfix restart


# usage: file_env VAR [DEFAULT]
#    ie: file_env 'XYZ_DB_PASSWORD' 'example'
# (will allow for "$XYZ_DB_PASSWORD_FILE" to fill in the value of
#  "$XYZ_DB_PASSWORD" from a file, especially for Docker's secrets feature)
file_env() {
	local var="$1"
	local fileVar="${var}_FILE"
	local def="${2:-}"
	if [ "${!var:-}" ] && [ "${!fileVar:-}" ]; then
		echo >&2 "error: both $var and $fileVar are set (but are exclusive)"
		exit 1
	fi
	local val="$def"
	if [ "${!var:-}" ]; then
		val="${!var}"
	elif [ "${!fileVar:-}" ]; then
		val="$(< "${!fileVar}")"
	fi
	export "$var"="$val"
	unset "$fileVar"
}

file_env 'IDM_SESSION_SECRET'
file_env 'IDM_ENCRYPTION_KEY'
file_env 'IDM_DB_PASS'
file_env 'IDM_DB_USER'
file_env 'IDM_ADMIN_ID'
file_env 'IDM_ADMIN_USER'
file_env 'IDM_ADMIN_EMAIL'
file_env 'IDM_ADMIN_PASS' 
file_env 'IDM_EX_AUTH_DB_USER'
file_env 'IDM_EX_AUTH_DB_PASS'


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