ARG NODE_VERSION=8.15.0-slim
FROM node:${NODE_VERSION}
ARG GITHUB_ACCOUNT=ging
ARG GITHUB_REPOSITORY=fiware-idm
ARG DOWNLOAD_TYPE=latest

ENV GITHUB_ACCOUNT=${GITHUB_ACCOUNT}
ENV GITHUB_REPOSITORY=${GITHUB_REPOSITORY}
ENV DOWNLOAD_TYPE=${DOWNLOAD_TYPE}

MAINTAINER FIWARE Identity Manager Team. DIT-UPM

WORKDIR /opt

# 
# ALL ENVIRONMENT VARIABLES
#
# ENV IDM_HOST "http://localhost"
# ENV IDM_PORT "3000"

# ENV IDM_DEBUG "true"

# ENV IDM_HTTPS_ENABLED true
# ENV IDM_HTTPS_PORT "443"

# ENV IDM_SESSION_SECRET "nodejs_idm"
# ENV IDM_SESSION_DURATION "3600000"

# ENV IDM_OAUTH_AUTH_LIFETIME "300"
# ENV IDM_OAUTH_ACC_LIFETIME "3600"
# ENV IDM_OAUTH_ASK_AUTH true
# ENV IDM_OAUTH_REFR_LIFETIME "1209600"
# ENV IDM_OAUTH_UNIQUE_URL false

# ENV IDM_API_LIFETIME "3600"

# ENV IDM_ENCRYPTION_KEY "nodejs_idm"

# ENV IDM_PDP_LEVEL "basic"
# ENV IDM_AUTHZFORCE_ENABLED false
# ENV IDM_AUTHZFORCE_HOST "localhost"
# ENV IDM_AUTHZFORCE_PORT" 8080"

# ENV IDM_DB_HOST "localhost"
# ENV IDM_DB_PASS "idm"
# ENV IDM_DB_USER "root"
# ENV IDM_DB_NAME "idm"
# ENV IDM_DB_DIALECT "mysql"
# ENV IDM_DB_PORT "3306"

# ENV IDM_EX_AUTH_ENABLED false
# ENV IDM_EX_AUTH_ID_PREFIX "external_"
# ENV IDM_EX_AUTH_PASSWORD_ENCRYPTION "sha1"
# ENV IDM_EX_AUTH_PASSWORD_ENCRYPTION_KEY undefined
# ENV IDM_EX_AUTH_DB_HOST "localhost"
# ENV IDM_EX_AUTH_PORT undefined
# ENV IDM_EX_AUTH_DB_NAME "db_name"
# ENV IDM_EX_AUTH_DB_USER "db_user"
# ENV IDM_EX_AUTH_DB_PASS "db_pass"
# ENV IDM_EX_AUTH_DB_USER_TABLE "user_view"
# ENV IDM_EX_AUTH_DIALECT "mysql"

# ENV IDM_EMAIL_HOST "localhost"
# ENV IDM_EMAIL_PORT "25"
# ENV IDM_EMAIL_ADDRESS "noreply@localhost"
# ENV IDM_EMAIL_LIST null

# ENV IDM_TITLE "Identity Manager"
# ENV IDM_THEME "default"

# ENV IDM_EIDAS_ENABLED false
# ENV IDM_EIDAS_GATEWAY_HOST "localhost"
# ENV IDM_EIDAS_NODE_HOST "https://se-eidas.redsara.es/EidasNode/ServiceProvider"
# ENV IDM_EIDAS_METADATA_LIFETIME "31536000"

# ENV IDM_ADMIN_ID    "admin"
# ENV IDM_ADMIN_USER  "admin"
# ENV IDM_ADMIN_EMAIL "admin@test.com"
# ENV IDM_ADMIN_PASS  "1234"



ENV IDM_HOST="http://localhost:3000" \
    IDM_PORT="3000" \
    IDM_PDP_LEVEL="basic" \
    IDM_DB_HOST="localhost" \
    IDM_DB_NAME="idm" \
    IDM_DB_DIALECT="mysql" \
    IDM_EMAIL_HOST="localhost" \
    IDM_EMAIL_PORT="25" \
    IDM_EMAIL_ADDRESS="noreply@localhost"

# IMPORTANT: For a Production Environment Use Docker Secrets to define
#  these values and add _FILE to the name of the variable.

# Install Ubuntu dependencies & email dependency & Configure mail
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential python debconf-utils curl git netcat  && \
    echo "postfix postfix/mailname string ${IDM_EMAIL_ADDRESS}" | debconf-set-selections && \
    echo "postfix postfix/main_mailer_type string 'Internet Site'" | debconf-set-selections && \
    apt-get install -y --no-install-recommends postfix mailutils && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
    sed -i 's/inet_interfaces = all/inet_interfaces = loopback-only/g' /etc/postfix/main.cf


#
# The following line retrieves the latest source code from GitHub.
#
# To obtain the latest stable release run this Docker file with the parameters
# --no-cache --build-arg DOWNLOAD_TYPE=stable
#
# Alternatively for local development, just copy this Dockerfile into file the
# root of the repository and copy over your local source using :
#
# COPY . /opt/fiware-idm
#
RUN if [ ${DOWNLOAD_TYPE} = "latest" ] ; then RELEASE="master"; else RELEASE=$(curl -s https://api.github.com/repos/${GITHUB_ACCOUNT}/${GITHUB_REPOSITORY}/releases/latest | grep 'tag_name' | cut -d\" -f4); fi && \
    if [ ${DOWNLOAD_TYPE} = "latest" ] ; then echo "INFO: Building Latest Development"; else echo "INFO: Building Release: ${RELEASE}"; fi && \
    apt-get update && \
    apt-get install -y  --no-install-recommends unzip && \
    wget --no-check-certificate -O source.zip https://github.com/${GITHUB_ACCOUNT}/${GITHUB_REPOSITORY}/archive/${RELEASE}.zip && \
    unzip source.zip && \
    mv ${GITHUB_REPOSITORY}-${RELEASE} /opt/fiware-idm && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /opt/fiware-idm

RUN rm -rf doc extras  && \
    npm cache clean -f   && \
    npm install --production  && \
    rm -rf /root/.npm/cache/* && \
    mkdir certs && \
    openssl genrsa -out idm-2018-key.pem 2048 && \
    openssl req -new -sha256 -key idm-2018-key.pem -out idm-2018-csr.pem -batch && \
    openssl x509 -req -in idm-2018-csr.pem -signkey idm-2018-key.pem -out idm-2018-cert.pem && \
    mv idm-2018-key.pem idm-2018-cert.pem idm-2018-csr.pem certs/


# For local development, when running the Dockerfile from the root of the repository
# use the following commands to configure Keyrock, the database and add an entrypoint:
#
# COPY extras/docker/config_database.js  extras/docker/config_database.js
# COPY extras/docker/config.js.template  extras/docker/config.js
# COPY extras/docker/docker-entrypoint.sh /opt/fiware-idm/docker-entrypoint.sh


# Copy config database file
COPY config_database.js extras/docker/config_database.js
# Copy config file
COPY config.js.template config.js

# Run Idm Keyrock
COPY docker-entrypoint.sh /opt/fiware-idm/docker-entrypoint.sh
RUN chmod 755 docker-entrypoint.sh

ENTRYPOINT ["/opt/fiware-idm/docker-entrypoint.sh"]

# Ports used by idm
EXPOSE ${IDM_PORT}
