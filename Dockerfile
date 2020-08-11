ARG NODE_VERSION=10
ARG GITHUB_ACCOUNT=ging
ARG GITHUB_REPOSITORY=fiware-idm

########################################################################################
#
# This build stage retrieves the source code and sets up node-SAAS
#
######################################################################################## 

FROM node:${NODE_VERSION}-alpine as builder
ARG GITHUB_ACCOUNT
ARG GITHUB_REPOSITORY

SHELL ["/bin/ash", "-o", "pipefail", "-c"]

ENV PYTHONUNBUFFERED=1

#RUN apk add --no-cache python3 && \
#    ln -sf python3 /usr/bin/python && \
#    python3 -m ensurepip && \
#    pip3 install --no-cache --upgrade pip setuptools

# hadolint ignore=DL3018,DL3013
RUN apk --no-cache add git python2 make gcc g++ ca-certificates openssl && \
    python -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip install --upgrade pip setuptools

WORKDIR /opt/fiware-idm
COPY . /opt/fiware-idm

RUN rm -rf doc extras doc.ja test node_modules && \
    npm cache clean -f  && \
    npm install --only=prod --no-package-lock --no-optional  && \
    rm -rf /root/.npm/cache/* && \
    mkdir certs && \
    openssl genrsa -out idm-2018-key.pem 2048 && \
    openssl req -new -sha256 -key idm-2018-key.pem -out idm-2018-csr.pem -batch && \
    openssl x509 -req -in idm-2018-csr.pem -signkey idm-2018-key.pem -out idm-2018-cert.pem && \
    mv idm-2018-key.pem idm-2018-cert.pem idm-2018-csr.pem certs/

########################################################################################
#
# This build stage creates an alpine build for production.
#
# IMPORTANT: For production environments use Docker Secrets to protect values of the 
# sensitive ENV variables defined below, by adding _FILE to the name of the relevant 
# variable.
#
#  - IDM_SESSION_SECRET
#  - IDM_ENCRYPTION_KEY
#  - IDM_DB_PASS
#  - IDM_DB_USER
#  - IDM_ADMIN_ID
#  - IDM_ADMIN_USER
#  - IDM_ADMIN_EMAIL
#  - IDM_ADMIN_PASS
#  - IDM_EX_AUTH_DB_USER
#  - IDM_EX_AUTH_DB_PASS
#  - IDM_DB_HOST
#
########################################################################################

FROM node:${NODE_VERSION}-alpine
ARG GITHUB_ACCOUNT
ARG GITHUB_REPOSITORY
ARG NODE_VERSION

WORKDIR /opt/fiware-idm
COPY --from=builder /opt/fiware-idm .


ENV IDM_HOST="http://localhost:3000" \
    IDM_PORT="3000" \
    IDM_PDP_LEVEL="basic" \
    IDM_DB_HOST="localhost" \
    IDM_DB_NAME="idm" \
    IDM_DB_DIALECT="mysql" \
    IDM_EMAIL_HOST="localhost" \
    IDM_EMAIL_PORT="25" \
    IDM_EMAIL_ADDRESS="noreply@localhost"


# hadolint ignore=DL3018
RUN apk add --no-cache ca-certificates bash

LABEL "maintainer"="FIWARE Identity Manager Team. DIT-UPM"
LABEL "org.opencontainers.image.authors"=""
LABEL "org.opencontainers.image.documentation"="https://fiware-idm.readthedocs.io/"
LABEL "org.opencontainers.image.vendor"="Universidad Politécnica de Madrid."
LABEL "org.opencontainers.image.licenses"="MIT"
LABEL "org.opencontainers.image.title"="Identity Manager - Keyrock"
LABEL "org.opencontainers.image.description"="OAuth2-based authentication of users and devices, user profile management, Single Sign-On (SSO) and Identity Federation across multiple administration domains."
LABEL "org.opencontainers.image.source"=https://github.com/${GITHUB_ACCOUNT}/${GITHUB_REPOSITORY}
LABEL "org.nodejs.version"=${NODE_VERSION}

USER node
ENV NODE_ENV=production
# Ports used by application
EXPOSE ${IDM_PORT:-3000}
CMD ["npm", "start"]
HEALTHCHECK  --interval=30s --timeout=3s --start-period=60s \
  CMD ["npm", "healthcheck"]

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

# ENV IDM_OAUTH_EMPTY_STATE false
# ENV IDM_OAUTH_AUTH_LIFETIME "300"
# ENV IDM_OAUTH_ACC_LIFETIME "3600"
# ENV IDM_OAUTH_ASK_AUTH true
# ENV IDM_OAUTH_REFR_LIFETIME "1209600"
# ENV IDM_OAUTH_UNIQUE_URL false

# ENV IDM_API_LIFETIME "3600"

# ENV IDM_ENCRYPTION_KEY "nodejs_idm"

# ENV IDM_CORS_ENABLED "false"
# ENV IDM_CORS_ORIGIN "*"
# ENV IDM_CORS_METHODS 'GET,HEAD,PUT,PATCH,POST,DELETE'
# ENV IDM_CORS_ALLOWED_HEADERS undefined
# ENV IDM_CORS_EXPOSED_HEADERS undefined
# ENV IDM_CORS_CREDENTIALS undefined
# ENV IDM_CORS_MAS_AGE undefined
# ENV IDM_CORS_PREFLIGHT false
# ENV IDM_CORS_OPTIONS_STATUS 204

# ENV IDM_PDP_LEVEL "basic"
# ENV IDM_AUTHZFORCE_ENABLED false
# ENV IDM_AUTHZFORCE_HOST "localhost"
# ENV IDM_AUTHZFORCE_PORT" 8080"

# ENV IDM_USAGE_CONTROL_ENABLED false
# ENV IDM_PTP_HOST localhost
# ENV IDM_PTP_PORT 8081

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