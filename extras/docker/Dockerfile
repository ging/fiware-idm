ARG NODE_VERSION=14
ARG GITHUB_ACCOUNT=ging
ARG GITHUB_REPOSITORY=fiware-idm
ARG DOWNLOAD=latest
ARG SOURCE_BRANCH=master
ARG HEADLESS=false

# Default Builder, distro and distroless build version
ARG BUILDER=node:${NODE_VERSION}
ARG DISTRO=node:${NODE_VERSION}-slim
ARG DISTROLESS=gcr.io/distroless/nodejs:${NODE_VERSION}
ARG PACKAGE_MANAGER=apt
ARG USER=node

########################################################################################
#
# This build stage retrieves the source code from GitHub. The default download is the 
# latest tip of the master of the named repository on GitHub.
#
# To obtain the latest stable release run this Docker file with the parameters:
# --no-cache --build-arg DOWNLOAD=stable
#
# To obtain any specific version of a release run this Docker file with the parameters:
# --no-cache --build-arg DOWNLOAD=1.7.0
#
######################################################################################## 

FROM ${BUILDER} as builder
ARG GITHUB_ACCOUNT
ARG GITHUB_REPOSITORY
ARG DOWNLOAD
ARG SOURCE_BRANCH
ARG PACKAGE_MANAGER

# hadolint ignore=DL3002
USER root

ENV PYTHONUNBUFFERED=1

# Ensure that the chosen package manger is supported by this Dockerfile
# also ensure that unzip is installed prior to downloading sources

# hadolint ignore=SC2039
RUN \
    if [ "${PACKAGE_MANAGER}" = "apt"  ]; then \
        echo -e "\033[0;34mINFO: Using default \"${PACKAGE_MANAGER}\".\033[0m"; \
        apt-get update; \
        apt-get install -y --no-install-recommends unzip git; \
    elif [ "${PACKAGE_MANAGER}" = "yum"  ]; then \
        echo -e "\033[0;33mWARNING: Overriding default package manager. Using \"${PACKAGE_MANAGER}\" .\033[0m"; \
        yum install -y unzip git; \
        yum clean all; \
    elif [ "${PACKAGE_MANAGER}" = "apk"  ]; then \
        echo -e "\033[0;33mWARNING: Overriding default package manager. Using \"${PACKAGE_MANAGER}\" .\033[0m"; \
        apk --update --no-cache add curl git make gcc g++ ca-certificates openssl unzip; \
    else \
        echo -e "\033[0;31mERROR: Package Manager \"${PACKAGE_MANAGER}\" not supported.\033[0m"; \
        exit 1; \
    fi

# As an Alternative for local development, just copy this Dockerfile into file the root of 
# the repository and replace the whole RUN statement below by the following COPY statement 
# in your local source using :
#
# COPY . /opt/fiware-idm
#

# hadolint ignore=DL3008
RUN \
    if [ "${DOWNLOAD}" = "latest" ] ; \
    then \
        RELEASE="${SOURCE_BRANCH}"; \
        echo "INFO: Building Latest Development from ${SOURCE_BRANCH} branch."; \
    elif [ "${DOWNLOAD}" = "stable" ]; \
    then \
        RELEASE=$(curl -s https://api.github.com/repos/"${GITHUB_ACCOUNT}"/"${GITHUB_REPOSITORY}"/releases/latest | grep 'tag_name' | cut -d\" -f4); \
        echo "INFO: Building Latest Stable Release: ${RELEASE}"; \
    else \
        RELEASE="${DOWNLOAD}"; \
        echo "INFO: Building Release: ${RELEASE}"; \
    fi && \
    RELEASE_CONCAT=$(echo "${RELEASE}" | tr / -); \
    curl -s -L https://github.com/"${GITHUB_ACCOUNT}"/"${GITHUB_REPOSITORY}"/archive/"${RELEASE}".zip > source.zip && \
    unzip source.zip -x "*/test/**" "*/doc/**" "*/doc.ja/**" "*/extras/**" && \
    rm source.zip && \
    mv "${GITHUB_REPOSITORY}-${RELEASE_CONCAT}" /opt/fiware-idm

WORKDIR /opt/fiware-idm

RUN \
    CXXFLAGS="--std=c++14" \
    npm install --only=prod --no-package-lock --no-optional  --unsafe-perm && \
    rm -rf /root/.npm/cache/* && \
    mkdir -p certs/applications && \
    chmod -R 777 certs && \
    openssl genrsa -out idm-2018-key.pem 2048 && \
    openssl req -new -sha256 -key idm-2018-key.pem -out idm-2018-csr.pem -batch && \
    openssl x509 -req -in idm-2018-csr.pem -signkey idm-2018-key.pem -out idm-2018-cert.pem && \
    mv idm-2018-key.pem idm-2018-cert.pem idm-2018-csr.pem certs/ && \
    chmod 755 certs/idm-2018-key.pem && \
    chmod -R 777 public

########################################################################################
#
# This build stage creates an anonymous user to be used with the distroless build
# as defined below.
#
########################################################################################
FROM ${BUILDER} AS anon-user
RUN sed -i -r "/^(root|nobody)/!d" /etc/passwd /etc/shadow /etc/group \
    && sed -i -r 's#^(.*):[^:]*$#\1:/sbin/nologin#' /etc/passwd


########################################################################################
#
# This build stage creates a distroless build for production.
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

FROM ${DISTROLESS} AS distroless
ARG GITHUB_ACCOUNT
ARG GITHUB_REPOSITORY
ARG NODE_VERSION
ARG HEADLESS

LABEL "maintainer"="FIWARE Identity Manager Team. DIT-UPM"
LABEL "description"="OAuth2-based authentication of users and devices, user profile management, Single Sign-On (SSO) and Identity Federation across multiple administration domains."
LABEL "name"="keyrock"
LABEL "summary"="Keyrock Identity Manager - Distroless"

LABEL "org.opencontainers.image.authors"=""
LABEL "org.opencontainers.image.documentation"="https://fiware-idm.readthedocs.io/"
LABEL "org.opencontainers.image.vendor"="Universidad Politécnica de Madrid."
LABEL "org.opencontainers.image.licenses"="MIT"
LABEL "org.opencontainers.image.title"="Identity Manager - Keyrock- Distroless"
LABEL "org.opencontainers.image.description"="OAuth2-based authentication of users and devices, user profile management, Single Sign-On (SSO) and Identity Federation across multiple administration domains."
LABEL "org.opencontainers.image.source"=https://github.com/${GITHUB_ACCOUNT}/${GITHUB_REPOSITORY}
LABEL "org.nodejs.version"=${NODE_VERSION}

WORKDIR /opt/fiware-idm
COPY --from=builder /opt/fiware-idm .
COPY --from=anon-user /etc/passwd /etc/shadow /etc/group /etc/

ENV IDM_HOST="http://localhost:3000" \
    IDM_PORT="3000" \
    IDM_PDP_LEVEL="basic" \
    IDM_DB_HOST="localhost" \
    IDM_DB_NAME="idm" \
    IDM_DB_DIALECT="mysql" \
    IDM_DB_SEED="false" \
    IDM_DB_MIGRATE="false" \
    IDM_EMAIL_HOST="localhost" \
    IDM_EMAIL_PORT="25" \
    IDM_EMAIL_ADDRESS="noreply@localhost"
ENV IDM_HEADLESS=$HEADLESS

USER nobody
ENV NODE_ENV=production
# Ports used by application
EXPOSE ${IDM_PORT:-3000}
CMD ["./bin/www"]
HEALTHCHECK  --interval=30s --timeout=3s --start-period=10s \
  CMD ["/nodejs/bin/node", "./bin/healthcheck"]


########################################################################################
#
# This build stage creates a build for production.
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

FROM ${DISTRO} AS distro
ARG GITHUB_ACCOUNT
ARG GITHUB_REPOSITORY
ARG NODE_VERSION
ARG HEADLESS

WORKDIR /opt/fiware-idm
COPY --from=builder /opt/fiware-idm .
COPY --from=builder /opt/fiware-idm/LICENSE /licenses/LICENSE

ENV IDM_HOST="http://localhost:3000" \
    IDM_PORT="3000" \
    IDM_PDP_LEVEL="basic" \
    IDM_DB_HOST="localhost" \
    IDM_DB_NAME="idm" \
    IDM_DB_DIALECT="mysql" \
    IDM_DB_MIGRATE="false" \
    IDM_DB_SEED="true" \
    IDM_EMAIL_HOST="localhost" \
    IDM_EMAIL_PORT="25" \
    IDM_EMAIL_ADDRESS="noreply@localhost"
ENV IDM_HEADLESS=$HEADLESS

# hadolint ignore=DL3018
RUN \
    if [ "${PACKAGE_MANAGER}" = "apk"  ]; then \
        apk add --no-cache ca-certificates bash openssl; \
    fi

LABEL "maintainer"="FIWARE Identity Manager Team. DIT-UPM"
LABEL "description"="OAuth2-based authentication of users and devices, user profile management, Single Sign-On (SSO) and Identity Federation across multiple administration domains."
LABEL "name"="keyrock"
LABEL "summary"="Keyrock Identity Manager"

LABEL "org.opencontainers.image.authors"=""
LABEL "org.opencontainers.image.documentation"="https://fiware-idm.readthedocs.io/"
LABEL "org.opencontainers.image.vendor"="Universidad Politécnica de Madrid."
LABEL "org.opencontainers.image.licenses"="MIT"
LABEL "org.opencontainers.image.title"="Keyrock Identity Manager"
LABEL "org.opencontainers.image.description"="OAuth2-based authentication of users and devices, user profile management, Single Sign-On (SSO) and Identity Federation across multiple administration domains."
LABEL "org.opencontainers.image.source"=https://github.com/${GITHUB_ACCOUNT}/${GITHUB_REPOSITORY}
LABEL "org.nodejs.version"=${NODE_VERSION}

# Node by default, use 406 for Alpine, 1001 for UBI
USER ${USER}
ENV NODE_ENV=production
# Ports used by application
EXPOSE ${IDM_PORT:-3000}
CMD ["npm", "start"]
HEALTHCHECK  --interval=30s --timeout=3s --start-period=60s \
  CMD ["npm", "run", "healthcheck"]

# 
# ALL ENVIRONMENT VARIABLES
#
# ENV IDM_HOST "http://localhost"
# ENV IDM_PORT "3000"
# ENV IDM_HEADLESS "false"
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
# IDM_OAUTH_NOT_REQUIRE_CLIENT_AUTH_GRANT_TYPE undefined
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

# ENV IDM_ENABLE_2FA false

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
