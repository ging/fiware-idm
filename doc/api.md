

# API OVERVIEW

+ [Idm API](#def-apiIdm)
+ [Using the FIWARE LAB instance (OAuth2)](#def-apiOAuth)
    - [Register your user account](#def-userAccount)
    - [Register your application](#def-registerApplication)
    - [OAuth2 Authentication](#def-oauth2Auth)
        - [Authorization Code Grant](#def-codeGrant)
            - [Authorization Request](#def-codeGrantAuthReq)
            - [Authorization Response](#def-codeGrantAuthRes)
            - [Access Token Request](#def-codeGrantTokReq)
            - [Access Token Response](#def-codeGrantTokRes)
        - [Implicit Grant](#def-implicitGrant)
            - [Authorization Request](#def-impliGrantAuthReq)
            - [Access Token Response](#def-impliGrantTokRes)
        - [Resource Owner Password Credentials Grant](#def-passwordGrant)
            - [Access Token Request](#def-passGrantTokReq)
            - [Access Token Response](#def-passGrantTokRes)
        - [Client Credentials Grant](#def-credentialsGrant)
             - [Access Token Request](#def-credGrantTokReq)
             - [Access Token Response](#def-credGrantTokRes)
        - [Refresh Token Grant](#def-refreshToken)
             - [Access Token Request](#def-refreseGrantTokReq)
             - [Access Token Response](#def-refreshGrantTokRes)
        - [Validate Access Tokens](#def-validate-tokens)
             - [Get user information and roles](#def-getUserInfo)
             - [Validate authorization](#def-validate-auth)
---
<a name="def-apiIdm"></a>
# Idm API 
Identity Manager (IdM) GE API specifications comply with existing standards for authentication and user and provide access information.

This specification is intended for Service Consumers (with developement skills) and Cloud Providers. For the former, this document provides a full specification of how to interoperate with the Identity Management Service API. For the latter, this specification indicates the interface to be provided to the client application developers to provide the described functionalities. To use this information, the reader should first have a general understanding of the Generic Enabler service.

The API user should be familiar with:

 - RESTful web services
 - HTTP/1.1
 - JSON and/or XML data serialization formats.

Users can perform these action through the API:

 - Authentication
 - Manage Applications
 - Manage Users
 - Manage Organizations
 - Manage Roles
 - Manage Permissions
 - Manage IoT Agents
 - Manage Pep Proxies

You can find a full description of how to make API requests in the [Keyrock Apiary](https://keyrock.docs.apiary.io/). The API requests should include an authentication token that can be created as is described [here.](https://keyrock.docs.apiary.io/#reference/keyrock-api/authentication)

<a name="def-apiOAuth"></a>
# Using the FIWARE LAB instance (OAuth2)

<a name="def-userAccount"></a>
## Register your user account


In order to start using the FIWARE IdM, you must first register your
own account. You can see how to do that [User & Programmers Manual](http://fiware-idm.readthedocs.org/en/latest/user_guide/#def-user-guide).

<a name="def-registerApplication"></a>
## Register your application

The next step is registering your own application. The `Callback URL` attribute is a mandatory parameter used in OAuth2 authentication. The IdM provides you with a `Client ID` and a `Client Secret` which are used in OAuth2. You can see how to do that [User & Programmers Manual](http://fiware-idm.readthedocs.org/en/latest/user_guide/#def-register-app).

<a name="def-oauth2Auth"></a>
## OAuth2 Authentication

The FIWARE IdM complies with the OAuth2 standard described in [RFC
6749](http://tools.ietf.org/html/rfc6749) and supports all four grant types defined there.

The `Authorization Basic` header is built with the `Client ID` and
`Client Secret` credentials provided by the FIWARE IdM following the 
[standard](http://tools.ietf.org/html/rfc2617). So the string will be

~~~
base64(client_id:client_secret)
~~~

The `redirect_uri` parameter must match the `Callback URL` attribute
provided in the application registration.

<a name="def-codeGrant"></a>
### Authorization Code Grant

The authorization code is obtained by using an authorization server (the
IdM) as an intermediary between the client (the registrered application)
and resource owner (the user). Instead of requesting authorization
directly from the resource owner, the client directs the resource owner
to an authorization server (via its user-agent as defined in
[RFC2616](http://tools.ietf.org/html/rfc2616>), which in turn directs
the resource owner back to the client with the authorization code.

<a name="def-codeGrantAuthReq"></a>
#### Authorization Request

~~~
GET /oauth2/authorize?response_type=code&client_id=1&state=xyz
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url HTTP/1.1
Host: idm-portal
~~~
The `response_type` attribute is mandatory and must be set to
`code`. The `client_id` attribute is the one provided by the FIWARE
IdM upon application registration. The `redirect_uri` attribute must
match the `Callback URL` attribute provided to the IdM within the
application registration. `state` is optional and for internal use of
you application, if needed.

<a name="def-codeGrantAuthRes"></a>
#### Authorization Response

~~~
HTTP/1.1 302 Found
Location: https://client.example.com/callback_url?code=SplxlOBeZQQYbYS6WxSbIA&state=xyz
~~~
<a name="def-codeGrantTokReq"></a>
#### Access Token Request

~~~
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=SplxlOBeZQQYbYS6WxSbIA
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url
~~~
<a name="def-codeGrantTokRes"></a>
#### Access Token Response
~~~
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store
Pragma: no-cache

{
    "access_token":"2YotnFZFEjr1zCsicMWpAA",
    "token_type":"bearer",
    "expires_in":3600,
    "refresh_token":"tGzv3JOkF0XG5Qx2TlKWIA",
}
~~~
<a name="def-implicitGrant"></a>
### Implicit Grant

The implicit grant is a simplified authorization code flow optimized for
clients implemented in a browser using a scripting language such as
JavaScript. In the implicit flow, instead of issuing the client an
authorization code, the client is issued an access token directly (as
the result of the resource owner authorization). The grant type is
implicit, as no intermediate credentials (such as an authorization code)
are issued (and later used to obtain an access token).

<a name="def-impliGrantAuthReq"></a>
#### Authorization Request
~~~
GET /oauth2/authorize?response_type=token&client_id=1&state=xyz
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url HTTP/1.1
Host: idm-portal
~~~

The `response_type` attribute is mandatory and must be set to `token`.

The `client_id` attribute is the one provided by the FIWARE IdM upon application registration. 

The `redirect_uri` attribute must match the `Callback URL` attribute provided to the IdM within the application registration. 

`state` is optional and for internal use of you application, if needed.

<a name="def-impliGrantTokRes"></a>
#### Access Token Response
~~~
HTTP/1.1 302 Found
Location: https://client.example.com/callback_url?token=SplxlOBeZQQYbYS6WxSbIA&token_type=Bearer&expires_in=3600&state=xyz&
~~~

<a name="def-passwordGrant"></a>
### Resource Owner Password Credentials Grant

The resource owner password credentials (i.e., username and password)
can be used directly as an authorization grant to obtain an access
token.

<a name="def-passGrantTokReq"></a>
#### Access Token Request
~~~
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=password&username=demo&password=123
~~~
<a name="def-passGrantTokRes"></a>
#### Access Token Response
See [Authorization Code Grant](#def-codeGrantTokRes)

<a name="def-refreshToken"></a>
### Refresh Token Grant

The client can request for a new token using the refresh token obtained the first time through another grant type except the client credentials grant type.

<a name="def-refreshGrantTokReq"></a>
#### Access Token Request

~~~
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&refresh_token=tGzv3JOkF0XG5Qx2TlKWIA
~~~

<a name="def-refreshGrantTokRes"></a>
#### Access Token Response

See [Authorization Code Grant](#def-codeGrantTokRes)

<a name="def-credentialsGrant"></a>
### Client Credentials Grant

The client can request an access token using only its client
credentials.

<a name="def-credGrantTokReq"></a>
#### Access Token Request

~~~
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
~~~

<a name="def-credGrantTokRes"></a>
#### Access Token Response

See [Authorization Code Grant](#def-codeGrantTokRes)

<a name="def-validate-tokens"></a>
## Validate Access Tokens

Once you have created an OAuth2.0 Access Token associated to a user, you can validate it in order to retrieve the user information and roles. Furthermore, if you have configured [Keyrock as PDP](http://fiware-idm.readthedocs.io/en/latest/admin_guide/#authorization) you can use the same endpoint for checking if the user is authorized to perform an specific action in the application.

**Warning** 
> Be aware that if you used the Client Credentials Grant to
> obtain the token there is no such thing as an 'authorizing user'
> because of the nature of this grant. You can still use this endpoint
> to validate the token, but the JSON (if the token is valid) will be
> empty.

<a name="def-getUserInfo"></a>
### Get user information and roles

Request:
~~~
GET /user?access_token=2YotnFZFEjr1zCsicMWpAA
~~~
Example response:
~~~
    {
      "organizations": [
        {
          "id": "13e88767-7473-472d-9c33-110c5bed2a57",
          "name": "test_org",
          "description": "my org",
          "website": null,
          "roles": [
            {
              "id": "9c4e8db4-a56b-4731-bfc6-7dd8fb2fbea3",
              "name": "test"
            }
          ]
        }
      ],
      "displayName": "My User",
      "roles": [
        {
          "id": "9c4e8db4-a56b-4731-bfc6-7dd8fb2fbea3",
          "name": "test"
        }
      ],
      "app_id": "ff03921a-a772-4220-9854-e2d499ae474a",
      "isGravatarEnabled": false,
      "email": "myuser@test.com",
      "id": "myuser",
      "authorization_decision": "",
      "app_azf_domain": "",
      "username": "myuser"
    }
~~~

<a name="def-validate-auth"></a>
### Validate authorization

If you have configured [Keyrock as PDP](http://fiware-idm.readthedocs.io/en/latest/admin_guide/#authorization) you can use the same endpoint for checking if the user is authorized to perform an specific action to an specific resource in the scope of an application.

In the user information response, the decision regarding authorization will be included.

Request:
~~~
GET /user?access_token=2YotnFZFEjr1zCsicMWpAA&action=GET&resource=myResource&app_id=ea3edd2e-2220-4489-af7d-6d60fffb7d1a
~~~
Example response:
~~~
    {
      "organizations": [
        {
          "id": "13e88767-7473-472d-9c33-110c5bed2a57",
          "name": "test_org",
          "description": "my org",
          "website": null,
          "roles": [
            {
              "id": "9c4e8db4-a56b-4731-bfc6-7dd8fb2fbea3",
              "name": "test"
            }
          ]
        }
      ],
      "displayName": "My User",
      "roles": [
        {
          "id": "9c4e8db4-a56b-4731-bfc6-7dd8fb2fbea3",
          "name": "test"
        }
      ],
      "app_id": "ff03921a-a772-4220-9854-e2d499ae474a",
      "isGravatarEnabled": false,
      "email": "myuser@test.com",
      "id": "myuser",
      "authorization_decision": "Permit",
      "app_azf_domain": "",
      "username": "myuser"
    }
~~~