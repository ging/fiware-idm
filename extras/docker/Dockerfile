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
RUN git clone https://github.com/ging/mesias.git && \
	cd mesias && \
	npm install

# Run PEP Proxy
WORKDIR /opt/mesias

# Run application
COPY docker-entrypoint.sh /opt/mesias/docker-entrypoint.sh
RUN chmod 755 docker-entrypoint.sh
ENTRYPOINT ["/opt/mesias/docker-entrypoint.sh"]
