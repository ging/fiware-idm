FROM ubuntu:14.04

MAINTAINER FIWARE Identity Manager Team. DIT-UPM

WORKDIR /opt

# Install Ubuntu dependencies
RUN sudo apt-get update && \
	sudo apt-get install curl git build-essential -y

# Install PPA
RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -

# Install nodejs
RUN sudo apt-get update && \
	sudo apt-get install nodejs -y

# Update npm
RUN sudo npm cache clean -f && \
	sudo npm install -g n && \
	sudo n stable

# Download latest version of the code and install npm dependencies
RUN git clone https://github.com/ging/fiware-idm.git && \
	cd fiware-idm && \
	npm install

# Change Workdir
WORKDIR /opt/fiware-idm

# Copy config file
RUN cp config.js.template config.js

# Create certificates for https
RUN mkdir certs
RUN openssl genrsa -out idm-2018-key.pem 2048
RUN openssl req -new -sha256 -key idm-2018-key.pem -out idm-2018-csr.pem -batch
RUN openssl x509 -req -in idm-2018-csr.pem -signkey idm-2018-key.pem -out idm-2018-cert.pem
RUN mv idm-2018-key.pem idm-2018-cert.pem idm-2018-csr.pem certs/

# Copy config database file
COPY config_database.js extras/docker/config_database.js

# Run Idm Keyrock
COPY docker-entrypoint.sh /opt/fiware-idm/docker-entrypoint.sh
RUN chmod 755 docker-entrypoint.sh

ENTRYPOINT ["/opt/fiware-idm/docker-entrypoint.sh"]
