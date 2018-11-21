
# API OVERVIEW

+ [Idm API](#def-apiIdm)
+ [Using the FIWARE LAB instance (OAuth2)](#def-apiOAuth)
    - [Register your user account](#def-userAccount)
    - [Register your application](#def-registerApplication)
    - [OAuth2 Authentication](#def-oauth2Auth)
        - [Authorization Code Grant](#def-codeGrant)
            - [Authorization Request](#def-codeGrantAuthReq)
            - [Authorization Request For Permanent Token](#def-codeGrantAuthPermReq)
            - [Authorization Response](#def-codeGrantAuthRes)
            - [Access Token Request](#def-codeGrantTokReq)
            - [Access Token Response](#def-codeGrantTokRes)
        - [Implicit Grant](#def-implicitGrant)
            - [Authorization Request](#def-impliGrantAuthReq)
            - [Authorization Request For Permanent Token](#def-implicitGrantAuthPermReq)
            - [Access Token Response](#def-impliGrantTokRes)
        - [Resource Owner Password Credentials Grant](#def-passwordGrant)
            - [Access Token Request](#def-passGrantTokReq)
            - [Permanent Access Token Request](#def-passGrantTokPermReq)
            - [Access Token Response](#def-passGrantTokRes)
        - [Client Credentials Grant](#def-credentialsGrant)
            - [Access Token Request](#def-credGrantTokReq)
            - [Permanent Access Token Request](#def-credGrantTokPermReq) 
            - [Access Token Response](#def-credGrantTokRes)
        - [Refresh Token Grant](#def-refreshToken)
            - [Access Token Request](#def-refreseGrantTokReq)
            - [Permanent Token Request](#def-refreseGrantTokPermReq)
            - [Access Token Response](#def-refreshGrantTokRes)
        - [Validate Access Tokens](#def-validate-tokens)
            - [Get user information and roles](#def-getUserInfo)
            - [Validate authorization](#def-validate-auth)
        - [Revoke Token](#def-revoke-token)
        - [Select Token Type](#def-select-token)
            - [Access JWT Request](#def-JWTRequest)
            - [Access JWT Response](#def-JWTResponse)

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

<a name="def-codeGrantAuthPermReq"></a>
#### Authorization Request For Permanent Token
~~~
GET /oauth2/authorize?response_type=code&client_id=1&state=xyz
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url&scope=permanent HTTP/1.1
Host: idm-portal
~~~
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

<a name="def-implicitGrantAuthPermReq"></a>
#### Authorization Request For Permanent Token
~~~
GET /oauth2/authorize?response_type=token&client_id=1&state=xyz
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url&scope=permanent HTTP/1.1
Host: idm-portal
~~~

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

<a name="def-passGrantTokPermReq"></a>
#### Permanent Token Request
~~~
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=password&username=demo&password=123&scope=permanent
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

<a name="def-refreshGrantTokPermReq"></a>
#### Permanent Token Request
~~~
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&refresh_token=tGzv3JOkF0XG5Qx2TlKWIA&scope=permanent
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

<a name="def-credGrantTokPermReq"></a>
#### Permanent Token Request
~~~
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&scope=permanent
~~~

<a name="def-credGrantTokRes"></a>
#### Access Token Response

See [Authorization Code Grant](#def-codeGrantTokRes)

<a name="def-validate-tokens"></a>
### Validate Access Tokens

Once you have created an OAuth2.0 Access Token associated to a user, you can validate it in order to retrieve the user information and roles. Furthermore, if you have configured [Keyrock as PDP](http://fiware-idm.readthedocs.io/en/latest/admin_guide/#authorization) you can use the same endpoint for checking if the user is authorized to perform an specific action in the application.

**Warning** 
> Be aware that if you used the Client Credentials Grant to
> obtain the token there is no such thing as an 'authorizing user'
> because of the nature of this grant. You can still use this endpoint
> to validate the token, but the JSON (if the token is valid) will be
> empty.

<a name="def-revoke-token"></a>
### Revoke Token
In order to revoke a token, the following request should be send:
~~~
POST /oauth2/revoke HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW  
Content-Type: application/x-www-form-urlencoded  

token=2YotnFZFEjr1zCsicMWpAA&token_type_hint=access_token
~~~
Either Refresh or Access Token could be revoked. In case of Refresh Token, all Access Token associated to this will be revoked.

token_type_hint is optional and can have the values “access_token" or “refresh_token” depending the type of token you are trying to revoke. These value helps Keyrock to revoke tokens quickly.

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


<a name="#def-select-token"></a>
### Select Token Type

Keyrock IdM allows you to choose the type of token to be generated when receiving an OAuth request. By default, the application creates Bearer Tokens but it can be configured to generate [JSON Web Tokens](https://tools.ietf.org/html/rfc7519). It can be also configured to generate permanent tokens (Bearer or JWT) as described in previous sections. These permanent tokens would never expired. These token types options could be selected in the interfaces as shown in the following figure:

<p align="center"><img src="https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_SelectTokenType.png" width="740" align="center"></p>
<p align="center">Figure 1: Select token type</p>

JWT is a safe way to represent a set information between two parties. A JWT is composed of a header, a payload and a signatures separated by dots. More information about JWT could be found in this [link.](https://jwt.io/) If JWT is selected, a secret is provided in order to validate the token and obtain the user information.

<p align="center"><img src="https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_TokenTypeJwt.png" width="740" align="center"></p>
<p align="center">Figure 1: JSON Web Token type</p>


<a name="def-JWTRequest"></a>
#### Access Token Request with JWT

The JWT generation could be done through scope option in the request. 
- Authorization Code Grant and Implicit Grant should be included in url as a query parameter. For instance in an Authorization Code request:
~~~
GET /oauth2/authorize?response_type=code&client_id=1&state=xyz
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url&scope=jwt HTTP/1.1
Host: idm-portal
~~~
- In the rest of grants it should be included in the body. For instance in a Resource Owner Password Credentials request:
~~~
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=password&username=demo&password=123&scope=jwt
~~~
In order to generate a permanent JWT, it should be included both permanent and  in the scope of the request.

- For Authorization Code Grant and Implicit Grant:
~~~
GET /oauth2/authorize?response_type=code&client_id=1&state=xyz
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url&scope=jwt,permanent HTTP/1.1
Host: idm-portal
~~~
- For the rest of grants:
~~~
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=password&username=demo&password=123&scope=jwt,permanent
~~~

<a name="def-JWTResponse"></a>
#### Access Token Response
~~~
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store
Pragma: no-cache

{
    "access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdhbml6YXRpb25zIjpbXSwiZGlzcGxheU5hbWUiOiIiLCJyb2xlcyI6W3siaWQiOiI1ZGNlMDVmMS1lMjg0LTQyMmEtYmViMS1mODhiZTMwYTg5MDAiLCJuYW1lIjoiYWFhYWEifV0sImFwcF9pZCI6IjFiNWJhY2U2LWIzZDUtNGE1ZC05MjU5LWY1MzI1OTg3NDk3ZSIsInRydXN0ZWRfYXBwcyI6W10sImlzR3JhdmF0YXJFbmFibGVkIjpmYWxzZSwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsImlkIjoiYWRtaW4iLCJhdXRob3JpemF0aW9uX2RlY2lzaW9uIjoiIiwiYXBwX2F6Zl9kb21haW4iOiIzclQ5d3NyOUVlaW9OZ0pDckJFQUFnIiwidXNlcm5hbWUiOiJhZG1pbiIsInR5cGUiOiJ1c2VyIiwiaWF0IjoxNTM5MDk1ODA2LCJleHAiOjE1MzkwOTk0MDZ9.-fYFHyPjPpA52gTEqMjppmERqiIZDgGKG5bJqVh0o68",
    "token_type":"jwt",
    "refresh_token":"a581cb04b116e26b175002bc2e05551042fafbda"
}
~~~
If "permanent" option is included in the request, the refresh token would not be generate.