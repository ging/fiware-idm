# How to use IdM Keyrock with Docker

To use this Generic Enabler you need to install
[docker](https://docs.docker.com/installation/) and
[docker-compose](https://docs.docker.com/compose/install/) on your machine. Two
images are needed to run it: the `fiware/idm` image and the
`mysql/mysql-server:5.7.21` image.

You can perform serveral actions using Docker:

-   You can run the service with `docker-compose` using images that we provide
    in Docker Hub.
-   You can build your own image using the `Dockerfile` we provide and then run
    with `docker-compose`.
-   Other features.

## Run the service with docker compose

In order to run the IdM Keyrock follow these steps:

1.  Create a directory.
2.  Create a new file called `docker-compose.yml` inside your directory with the
    following code and:

```yml
version: '3.5'
services:
    keyrock:
        image: fiware/idm:7.6.0
        container_name: fiware-keyrock
        hostname: keyrock
        networks:
            default:
                ipv4_address: 172.18.1.5
        depends_on:
            - mysql-db
        ports:
            - '3000:3000'
            - '443:443'
        environment:
            - DEBUG=idm:*
            - IDM_DB_HOST=mysql-db
            - IDM_HOST=http://localhost:3000
            - IDM_PORT=3000
            # Development use only
            # Use Docker Secrets for Sensitive Data
            - IDM_DB_PASS=secret
            - IDM_DB_USER=root
            - IDM_ADMIN_USER=admin
            - IDM_ADMIN_EMAIL=admin@test.com
            - IDM_ADMIN_PASS=1234
            # If sending eMails point to any STMP server
            - IDM_EMAIL_HOST=mailer
            - IDM_EMAIL_PORT=25

    mysql-db:
        restart: always
        image: mysql:5.7
        hostname: mysql-db
        container_name: db-mysql
        expose:
            - '3306'
        ports:
            - '3306:3306'
        networks:
            default:
                ipv4_address: 172.18.1.6
        environment:
            # Development use only
            # Use Docker Secrets for Sensitive Data
            - 'MYSQL_ROOT_PASSWORD=secret'
            - 'MYSQL_ROOT_HOST=172.18.1.5'
        volumes:
            - mysql-db:/var/lib/mysql

    mailer:
        restart: always
        image: mazdermind/docker-mail-relay
        hostname: mailer
        container_name: mailer
        ports:
            - '25:25'
        environment:
            - SMTP_LOGIN=<login> # Login to connect to the external relay
            - SMTP_PASSWORD=<password> # Password to connect to the external relay
            - EXT_RELAY_HOST=<hostname> # External relay DNS name
            - EXT_RELAY_PORT=25
            - ACCEPTED_NETWORKS=172.18.1.0/24
            - USE_TLS=no
networks:
    default:
        ipam:
            config:
                - subnet: 172.18.1.0/24
volumes:
    mysql-db: ~
```

The different params mean:

-   networks. Here is defined the network that will be used to run the two
    containers.
-   volumes. Docker is non-persistent, so if you turn off Mysql container all
    your data will be lose. To prevent this from happening a volume is created
    to store data in the host.
-   services. Two services are defined: mysql and fiware-idm. Both need some
    environment variables to be run:
    -   MYSQL_ROOT_PASSWORD. Define the password used by IdM Keyrock in order to
        perform requests.
    -   MYSQL_ROOT_HOST. Define the IP Address of the IdM Keyrock container in
        order to allow requests from it.
    -   IDM_DB_HOST. Define the name of the database container.

3.  Use `sudo docker-compose up` to run the IdM Keyrock. This will automatically
    download the two images and run the IdM Keyrock service.

### Docker Secrets

As an alternative to passing sensitive information via environment variables,
`_FILE` may be appended to some sensitive environment variables, causing the
initialization script to load the values for those variables from files present
in the container. In particular, this can be used to load passwords from Docker
secrets stored in `/run/secrets/<secret_name>` files. For example:

```console
docker run --name keyrock -e IDM_DB_USER_FILE=/run/secrets/password -d fiware/idm
```

Currently, this `_FILE` suffix is supported for:

-   `IDM_SESSION_SECRET`
-   `IDM_ENCRYPTION_KEY`
-   `IDM_DB_PASS`
-   `IDM_DB_USER`
-   `IDM_ADMIN_ID`
-   `IDM_ADMIN_USER`
-   `IDM_ADMIN_EMAIL`
-   `IDM_ADMIN_PASS`
-   `IDM_EX_AUTH_DB_USER`
-   `IDM_EX_AUTH_DB_PASS`
-   `IDM_DB_HOST`

## Sending eMails

If you intend to send eMails when running a dockerized Keyrock instance, a
separate Mail Relay docker container is needed to be set up when running within
a private network.

The Keyrock `IDM_EMAIL_HOST` and `IDM_EMAIL_PORT` docker ENV variables to point
to the SMTP relay server .

The SMTP relay settings should then be altered to match the external SMTP
server. For example to use the Gmail SMTP server the following settings are
required.

-   Server address: `smtp.gmail.com`
-   Username: Your Gmail address (for example, `example@gmail.com`)
-   Password: Your Gmail password
-   Port (TLS): `587`
-   Port (SSL): `465`
-   TLS/SSL required: `Yes`

## Build your own image

You can download the [IdM's code](https://github.com/ging/fiware-idm) from
GitHub and navigate to `extras/docker` directory. There you will find the
Dockerfile to create your own image and the docker-compose.yml file described in
the previous section as well as other files needed to run the container. There,
to compile your own image just run:

```console
    sudo docker build -t idm-fiware-image .
```

> **Note** If you do not want to have to use `sudo` in this or in the next
> section follow
> [these instructions](https://docs.docker.com/installation/ubuntulinux/#create-a-docker-group).

This builds a new Docker image following the steps in `Dockerfile` and saves it
in your local Docker repository with the name `idm-fiware-image`. You can check
the available images in your local repository using:

```console
sudo docker images
```

> **Note** If you want to know more about images and the building process you
> can find it in
> [Docker's documentation](https://docs.docker.com/userguide/dockerimages/).

Edit the `docker-compose.yml` to change name of the fiware-idm image. Now you
can run as in the previous section:

```console
    sudo docker-compose up
```

## Other features

You can pass to the IdM container a configuration file to customize the service
using differents features from the default ones. In this
[link](https://github.com/ging/fiware-idm/blob/master/config.js.template) you
will find a template of the file. To copy the file to the container edit
`docker-compose.yml` and share the file through a volume:

```yml
fiware-idm:
    image: fiware/idm
    ports:
        - '3000:3000'
        - '443:443'
    networks:
        idm_network:
            ipv4_address: 172.18.1.6
    environment:
        - IDM_DB_HOST=mysql
    volumes:
        - path_to_file:/opt/fiware-idm/config.js
```

## Building using an alternative sources and Linux Distros

The `Dockerfile` is flexible enough to be able to use
[alternative base images](https://kuberty.io/blog/best-os-for-docker/) should
you wish. The base image defaults to using the `node:slim` distro, but other
base images can be injected using `--build-arg` parameters on the commmand line.
For example, to create a container based on
[Red Hat UBI (Universal Base Image) 8](https://developers.redhat.com/articles/2021/11/08/optimize-nodejs-images-ubi-8-nodejs-minimal-image)
add `BUILDER`, `DISTRO`, `PACKAGE_MANAGER` and `USER` parameters as shown:

```console
sudo docker build -t keyrock \
  --build-arg BUILDER=registry.access.redhat.com/ubi8/nodejs-14 \
  --build-arg DISTRO=registry.access.redhat.com/ubi8/nodejs-14-minimal \
  --build-arg PACKAGE_MANAGER=yum \
  --build-arg USER=1001 . --no-cache
```

To create a container based on [Alpine Linux](https://alpinelinux.org/about/)
add `BUILDER`, `DISTRO`, `PACKAGE_MANAGER` and `USER` parameters as shown:

```console
docker build -t keyrock \
  --build-arg BUILDER=node:16-alpine \
  --build-arg DISTRO=node:16-alpine \
  --build-arg PACKAGE_MANAGER=apk . \
  --build-arg USER=406 . --no-cache
```

Currently, the following `--build-arg` parameters are supported:

| Parameter           | Description                                                                                                                                                                                                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BUILDER`           | Preferred [linux distro](https://kuberty.io/blog/best-os-for-docker/) to use whilst building the image, defaults to `node:${NODE_VERSION}`                                                                                                                                              |
| `DISTRO`            | Preferred [linux distro](https://kuberty.io/blog/best-os-for-docker/) to use for the final container image, defaults to `node:${NODE_VERSION}-slim`                                                                                                                                     |
| `DISTROLESS`        | Preferred [Distroless Image](https://betterprogramming.pub/how-to-harden-your-containers-with-distroless-docker-images-c2abd7c71fdb) to use for the final container. Distroless images can be built using `-target=distroless` , defaults to `gcr.io/distroless/nodejs:${NODE_VERSION}` |
| `DOWNLOAD`          | The GitHub SHA or tag to download - defaults to `latest`                                                                                                                                                                                                                                |
| `GITHUB_ACCOUNT`    | The GitHub Action to download the source files from, defaults to `ging`                                                                                                                                                                                                                 |
| `GITHUB_REPOSITORY` | The name of the GitHub repository to download the source files from, defaults to `fiware-idm`                                                                                                                                                                                           |
| `NODE_VERSION`      | the version of Node.js to use                                                                                                                                                                                                                                                           |
| `PACKAGE_MANAGER`   | Package manager to use whilst creating the build, defaults to `apt`                                                                                                                                                                                                                     |
| `SOURCE_BRANCH`     | The GitHub repository branch to download the source files from, defaults to `master`                                                                                                                                                                                                    |
| `USER`              | User in the final container image, defaults to `node`                                                                                                                                                                                                                                   |
