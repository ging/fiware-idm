# Quick Start Guide

Welcome to IdM Keyrock start guide. In this guide you will learn the basics in
which is based Keyrock: generate an OAuth token to enable authentication and
authorization to services.

First of all, you need to deploy a Keyrock instance. The easiest way to install
Keyrock is using Docker and Docker Compose. Create docker-compose.yml file and
copy the following content to it:

```yaml
version: '2'

networks:
    idm_network:
        driver: bridge
        ipam:
            config:
                - subnet: 172.18.1.0/24
                  gateway: 172.18.1.1

volumes:
    vol-mysql:

services:
    mysql:
        image: mysql/mysql-server:5.7.21
        ports:
            - '3306:3306'
        networks:
            idm_network:
                ipv4_address: 172.18.1.5
        volumes:
            - vol-mysql:/var/lib/mysql
        environment:
            - MYSQL_ROOT_PASSWORD=idm
            - MYSQL_ROOT_HOST=172.18.1.6

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
```

Afterwards, navigate to the directory in which you have created the
docker-compose.yml file and run:

```bash
docker-compose up
```

This will deploy two Docker containers: one for IdM Keyrock and another one for
the database instance (in this case is MySQL). The database is seeded with a
default user whose credentials are:

-   Email: `admin@test.com`

-   Password: 1234

In order to create an OAuth Token we first need to register an application on
Keyrock. We can do it by using the UI (previous
[log in](user_and_programmers_guide/user_guide.md#sign-in) with user
credentials) as described in
[register application](user_and_programmers_guide/application_guide.md#register-an-application)
or we can create through the API(in this guide we will user curl functionality
but in the
[apiary](https://keyrock.docs.apiary.io/#reference/keyrock-api/authentication)
you can find how to perform this authentication with other programming
languages):

&nbsp;&nbsp;1\. Generate an API token:

&nbsp;&nbsp;&nbsp;&nbsp;1.1\. Request using default user credentials.

```bash
curl --include \
     --request POST \
     --header "Content-Type: application/json" \
     --data-binary "{
  \"name\": \"admin@test.com\",
  \"password\": \"1234\"
}" \
'http://localhost:3000/v1/auth/tokens'
```

&nbsp;&nbsp;&nbsp;&nbsp;1.2\. Obtain API token from X-Subject-Header in response
(in this case is 04c5b070-4292-4b3f-911b-36a103f3ac3f):

```bash
Content-Type:application/json,application/json; charset=utf-8
X-Subject-Token:04c5b070-4292-4b3f-911b-36a103f3ac3f
Content-Length:74
ETag:W/"4a-jYFzvNRMQcIZ2P+p5EfmbN+VHcw"
Date:Mon, 19 Mar 2018 15:05:35 GMT
Connection:keep-alive
```

&nbsp;&nbsp;2\. Create an application using API token previously created:

&nbsp;&nbsp;&nbsp;&nbsp;2.1\. Request (check that redirect_uri is
`http://localhost/login`):

```bash
curl --include \
     --request POST \
     --header "Content-Type: application/json" \
     --header "X-Auth-token: <API-TOKEN>" \
     --data-binary "{
  \"application\": {
    \"name\": \"Test_application 1\",
    \"description\": \"description\",
    \"redirect_uri\": \"http://localhost/login\",
    \"url\": \"http://localhost\",
    \"grant_type\": [
      \"authorization_code\",
      \"implicit\",
      \"password\"
    ],
    \"token_types\": [
        \"jwt\",
        \"permanent\"
    ]
  }
}" \
'http://localhost:3000/v1/applications'
```

&nbsp;&nbsp;&nbsp;&nbsp;2.2\. Example response with application info. Save id
and secret to be used later to obtain an OAuth token.

```json
{
    "application": {
        "id": "a17bf9e3-628d-4000-8d25-37703975a528",
        "secret": "ac5df1fe-4caf-4ae6-9d21-60f3a9182887",
        "image": "default",
        "jwt_secret": "51129f085f3e1a80",
        "name": "Test_application 1",
        "description": "description",
        "redirect_uri": "http://localhost/login",
        "url": "http://localhost",
        "grant_type": "password,authorization_code,implicit",
        "token_types": "jwt,permanent,bearer",
        "response_type": "code,token"
    }
}
```

Now we have everything ready for creating an OAuth Token. In this case we are
going to use the Resource Owner Password credentials flow to generate the token.
You have to create two environment variables (ID and SECRET) with your own
values obtained in the previous step (application.ID and application.secret).

```bash
ID=a17bf9e3-628d-4000-8d25-37703975a528
SECRET=ac5df1fe-4caf-4ae6-9d21-60f3a9182887
curl -X POST -H "Authorization: Basic $(echo -n $ID:$SECRET | base64 -w 0)"   --header "Content-Type: application/x-www-form-urlencoded" -d "grant_type=password&username=admin@test.com&password=1234" http://localhost:3000/oauth2/token

```

In the body of the response we can found the OAuth Token in "access_token"
parameter:

```json
{
    "access_token": "cd8c8e41ab0db220315ed54f173087d281a4c686",
    "token_type": "Bearer",
    "expires_in": 3599,
    "refresh_token": "8b96bc9dfbc8f1c0bd53e18720b6feb5b47de661",
    "scope": ["bearer"]
}
```

Last, you can retrieve information about the user who has generated the token
by:

```bash
curl "http://localhost:3000/user?access_token=cd8c8e41ab0db220315ed54f173087d281a4c686"
```

And Keyrock will send:

```json
{
    "organizations": [],
    "displayName": "",
    "roles": [],
    "app_id": "a17bf9e3-628d-4000-8d25-37703975a528",
    "trusted_apps": [],
    "isGravatarEnabled": false,
    "email": "admin@test.com",
    "id": "admin",
    "authorization_decision": "",
    "app_azf_domain": "",
    "eidas_profile": {},
    "username": "admin"
}
```
