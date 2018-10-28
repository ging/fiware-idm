FROM ubuntu:16.04

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


# Install Ubuntu dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential debconf-utils ca-certificates curl git netcat  && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install email dependency
RUN apt-get update && \
    echo "postfix postfix/mailname string noreply@localhost" | debconf-set-selections && \
    echo "postfix postfix/main_mailer_type string 'Internet Site'" | debconf-set-selections && \
    apt-get install -y --no-install-recommends  mailutils && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*


# Configure mail
RUN sed -i 's/inet_interfaces = all/inet_interfaces = loopback-only/g' /etc/postfix/main.cf

# Install PPA
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
    apt-get install -y --no-install-recommends nodejs &&\
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install FIWARE IdM
COPY ./ /opt/fiware-idm
WORKDIR /opt/fiware-idm
RUN rm -rf node_modules doc extras && \
    npm cache clean -f && \
    npm install --production --silent && \
    rm -rf /root/.npm/cache/*

# Change Workdir
WORKDIR /opt/fiware-idm

# Create certificates for https
RUN mkdir certs && \
    openssl genrsa -out idm-2018-key.pem 2048 && \
    openssl req -new -sha256 -key idm-2018-key.pem -out idm-2018-csr.pem -batch && \
    openssl x509 -req -in idm-2018-csr.pem -signkey idm-2018-key.pem -out idm-2018-cert.pem && \
    mv idm-2018-key.pem idm-2018-cert.pem idm-2018-csr.pem certs/

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

