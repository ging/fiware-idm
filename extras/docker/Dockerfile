ARG NODE_VERSION=8.12.0-slim
FROM node:${NODE_VERSION}
ARG GITHUB_ACCOUNT=ging
ARG GITHUB_REPOSITORY=fiware-idm
ARG DOWNLOAD_TYPE=latest

ENV GITHUB_ACCOUNT=${GITHUB_ACCOUNT}
ENV GITHUB_REPOSITORY=${GITHUB_REPOSITORY}
ENV DOWNLOAD_TYPE=${DOWNLOAD_TYPE}

MAINTAINER FIWARE Identity Manager Team. DIT-UPM

WORKDIR /opt

ENV IDM_HOST "http://localhost:3000" \
    IDM_PORT "3000" \
    IDM_PDP_LEVEL "basic" \
    DATABASE_HOST "localhost" \
    IDM_DB_NAME "idm" \
    IDM_DIALECT "mysql" \
    IDM_EMAIL_HOST "localhost" \
    IDM_EMAIL_PORT "25" \
    IDM_EMAIL_ADDRESS "noreply@localhost"

# IMPORTANT: For a Production Environment Use Docker Secrets to define 
#  these values and add _FILE to the name of the variable.

# ENV IDM_ADMIN_ID    "admin"
# ENV IDM_ADMIN_USER  "admin"
# ENV IDM_ADMIN_EMAIL "admin@test.com"
# ENV IDM_ADMIN_PASS  "1234" 
# ENV IDM_SESSION_SECRET "nodejs_idm" 
# ENV IDM_ENCRYPTION_KEY "nodejs_idm" 
# ENV IDM_DB_PASS "idm"
# ENV IDM_DB_USER "root"
# ENV IDM_EX_AUTH_DB_USER "db_user"
# ENV IDM_EX_AUTH_DB_PASS "db_pass"

# ENV IDM_HTTPS_ENABLED false
# ENV IDM_HTTPS_PORT "443"

# ENV IDM_AUTHZFORCE_ENABLED false
# ENV IDM_AUTHZFORCE_HOST "localhost"
# ENV IDM_AUTHZFORCE_PORT" 8080"

# ENV IDM_EX_AUTH_ENABLED false
# ENV IDM_EX_AUTH_DRIVER "custom_authentication_driver"
# ENV IDM_EX_AUTH_DAB_HOST "localhost"
# ENV IDM_EX_AUTH_DB_NAME "db_name"
# ENV IDM_EX_AUTH_DB_USER_TABLE "user"
# ENV IDM_EX_AUTH_DIALECT "mysql"


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
    apt-get remove -y unzip && \
    apt-get -y autoremove

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

