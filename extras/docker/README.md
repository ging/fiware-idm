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
