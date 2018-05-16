FROM ubuntu:16.04

MAINTAINER FIWARE Identity Manager Team. DIT-UPM

WORKDIR /opt

# Install Ubuntu dependencies
RUN apt-get update && \
    apt-get install build-essential ca-certificates curl git netcat -y --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Install node js
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Download latest version of the code and install npm dependencies
RUN git clone https://github.com/ging/fiware-idm.git && \
	cd fiware-idm && \
 	npm cache clean -f && \
 	npm install

# Change Workdir
WORKDIR /opt/fiware-idm

# Copy config file
RUN cp config.js.template config.js

# Create certificates for https
RUN mkdir certs && \
	openssl genrsa -out idm-2018-key.pem 2048 && \
	openssl req -new -sha256 -key idm-2018-key.pem -out idm-2018-csr.pem -batch && \
	openssl x509 -req -in idm-2018-csr.pem -signkey idm-2018-key.pem -out idm-2018-cert.pem && \
	mv idm-2018-key.pem idm-2018-cert.pem idm-2018-csr.pem certs/

# Copy config database file
COPY config_database.js extras/docker/config_database.js

# Run Idm Keyrock
COPY docker-entrypoint.sh /opt/fiware-idm/docker-entrypoint.sh
RUN chmod 755 docker-entrypoint.sh

ENTRYPOINT ["/opt/fiware-idm/docker-entrypoint.sh"]
