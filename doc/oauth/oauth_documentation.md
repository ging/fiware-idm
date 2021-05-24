# Introduction

The `Authorization Basic` header is built with the `Client ID` and
`Client Secret` credentials provided by the FIWARE IdM following the
[standard](http://tools.ietf.org/html/rfc2617). So the string will be

```bash
base64(client_id:client_secret)
```

The `redirect_uri` parameter must match the `Callback URL` attribute provided in
the application registration.

## Authorization Code Grant

The authorization code is obtained by using an authorization server (the IdM) as
an intermediary between the client (the registrered application) and resource
owner (the user). Instead of requesting authorization directly from the resource
owner, the client directs the resource owner to an authorization server (via its
user-agent as defined in [RFC2616](http://tools.ietf.org/html/rfc2616>), which
in turn directs the resource owner back to the client with the authorization
code.

### Authorization Request

```bash
GET /oauth2/authorize?response_type=code&client_id=1&state=xyz
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url HTTP/1.1
Host: idm-portal
```

The `response_type` attribute is mandatory and must be set to `code`. The
`client_id` attribute is the one provided by the FIWARE IdM upon application
registration. The `redirect_uri` attribute must match the `Callback URL`
attribute provided to the IdM within the application registration. `state` is
optional and for internal use of you application, if needed.

### Authorization Request For Permanent Token

```bash
GET /oauth2/authorize?response_type=code&client_id=1&state=xyz
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url&scope=permanent HTTP/1.1
Host: idm-portal
```

### Authorization Response

```bash
HTTP/1.1 302 Found
Location: https://client.example.com/callback_url?code=SplxlOBeZQQYbYS6WxSbIA&state=xyz
```

### Access Token Request

```bash
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=SplxlOBeZQQYbYS6WxSbIA
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url
```

### Access Token Response

```bash
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
```

## Implicit Grant

The implicit grant is a simplified authorization code flow optimized for clients
implemented in a browser using a scripting language such as JavaScript. In the
implicit flow, instead of issuing the client an authorization code, the client
is issued an access token directly (as the result of the resource owner
authorization). The grant type is implicit, as no intermediate credentials (such
as an authorization code) are issued (and later used to obtain an access token).

### Authorization Request

```bash
GET /oauth2/authorize?response_type=token&client_id=1&state=xyz
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url HTTP/1.1
Host: idm-portal
```

The `response_type` attribute is mandatory and must be set to `token`.

The `client_id` attribute is the one provided by the FIWARE IdM upon application
registration.

The `redirect_uri` attribute must match the `Callback URL` attribute provided to
the IdM within the application registration.

`state` is optional and for internal use of you application, if needed.

### Authorization Request For Permanent Token

```bash
GET /oauth2/authorize?response_type=token&client_id=1&state=xyz
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url&scope=permanent HTTP/1.1
Host: idm-portal
```

### Access Token Response

```bash
HTTP/1.1 302 Found
Location: https://client.example.com/callback_url?token=SplxlOBeZQQYbYS6WxSbIA&token_type=Bearer&expires_in=3600&state=xyz&
```

## Resource Owner Password Credentials Grant

The resource owner password credentials (i.e., username and password) can be
used directly as an authorization grant to obtain an access token.

### Access Token Request

```bash
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=password&username=demo&password=123
```

### Permanent Token Request

```bash
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=password&username=demo&password=123&scope=permanent
```

### Access Token Response

See [Authorization Code Grant](#access-token-response)

## Refresh Token Grant

The client can request for a new token using the refresh token obtained the
first time through another grant type except the client credentials grant type.

### Access Token Request

```bash
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&refresh_token=tGzv3JOkF0XG5Qx2TlKWIA
```

### Permanent Token Request

```bash
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&refresh_token=tGzv3JOkF0XG5Qx2TlKWIA&scope=permanent
```

### Access Token Response

See [Authorization Code Grant](#access-token-response)

## Client Credentials Grant

The client can request an access token using only its client credentials.

### Access Token Request

```bash
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
```

### Permanent Token Request

```bash
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&scope=permanent
```

### Access Token Response

See [Authorization Code Grant](#access-token-response)

## Validate Access Tokens

Once you have created an OAuth2.0 Access Token associated to a user, you can
validate it in order to retrieve the user information and roles. Furthermore, if
you have configured
[Keyrock as PDP](../installation_and_administration_guide/configuration.md#authorization)
you can use the same endpoint for checking if the user is authorized to perform
an specific action in the application.

**Warning**

> Be aware that if you used the Client Credentials Grant to obtain the token
> there is no such thing as an 'authorizing user' because of the nature of this
> grant. You can still use this endpoint to validate the token, but the JSON (if
> the token is valid) will be empty.

## Revoke Token

In order to revoke a token, the following request should be send:

```bash
POST /oauth2/revoke HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

token=2YotnFZFEjr1zCsicMWpAA&token_type_hint=access_token
```

Either Refresh or Access Token could be revoked. In case of Refresh Token, all
Access Token associated to this will be revoked.

token_type_hint is optional and can have the values “access_token" or
“refresh_token” depending the type of token you are trying to revoke. These
value helps Keyrock to revoke tokens quickly.

## Get user information and roles

Request:

```bash
GET /user?access_token=2YotnFZFEjr1zCsicMWpAA
```

Example response:

```javascript
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
```

## Validate authorization

If you have configured
[Keyrock as PDP](../installation_and_administration_guide/configuration.md#authorization)
you can use the same endpoint for checking if the user is authorized to perform
an specific action to an specific resource in the scope of an application.

In the user information response, the decision regarding authorization will be
included.

Request:

```bash
GET /user?access_token=2YotnFZFEjr1zCsicMWpAA&action=GET&resource=myResource&app_id=ea3edd2e-2220-4489-af7d-6d60fffb7d1a
```

Example response:

```javascript
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
```

## Select Token Type

Keyrock IdM allows you to choose the type of token to be generated when
receiving an OAuth request. By default, the application creates Bearer Tokens
but it can be configured to generate
[JSON Web Tokens](https://tools.ietf.org/html/rfc7519). It can be also
configured to generate permanent tokens (Bearer or JWT) as described in previous
sections. These permanent tokens would never expired. These token types options
could be selected in the interfaces as shown in the following figure:

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_SelectTokenType.png)

<p align="center">Figure 1: Select token type</p>

JWT is a safe way to represent a set information between two parties. A JWT is
composed of a header, a payload and a signatures separated by dots. More
information about JWT could be found in this [link.](https://jwt.io/) If JWT is
selected, a secret is provided in order to validate the token and obtain the
user information.

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_TokenTypeJwt.png)

<p align="center">Figure 2: JSON Web Token type</p>

### Access Token Request with JWT

The JWT generation could be done through scope option in the request.

-   Authorization Code Grant and Implicit Grant should be included in URL as a
    query parameter. For instance in an Authorization Code request:

```bash
GET /oauth2/authorize?response_type=code&client_id=1&state=xyz
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url&scope=jwt HTTP/1.1
Host: idm-portal
```

-   In the rest of grants it should be included in the body. For instance in a
    Resource Owner Password Credentials request:

```bash
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=password&username=demo&password=123&scope=jwt
```

In order to generate a permanent JWT, it should be included both permanent and
in the scope of the request.

-   For Authorization Code Grant and Implicit Grant:

```bash
GET /oauth2/authorize?response_type=code&client_id=1&state=xyz
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url&scope=jwt,permanent HTTP/1.1
Host: idm-portal
```

-   For the rest of grants:

```bash
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=password&username=demo&password=123&scope=jwt,permanent
```

### Access Token Response

```bash
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store
Pragma: no-cache

{
    "access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdhbml6YXRpb25zIjpbXSwiZGlzcGxheU5hbWUiOiIiLCJyb2xlcyI6W3siaWQiOiI1ZGNlMDVmMS1lMjg0LTQyMmEtYmViMS1mODhiZTMwYTg5MDAiLCJuYW1lIjoiYWFhYWEifV0sImFwcF9pZCI6IjFiNWJhY2U2LWIzZDUtNGE1ZC05MjU5LWY1MzI1OTg3NDk3ZSIsInRydXN0ZWRfYXBwcyI6W10sImlzR3JhdmF0YXJFbmFibGVkIjpmYWxzZSwiZW1haWwiOiJhZG1pbkB0ZXN0LmNvbSIsImlkIjoiYWRtaW4iLCJhdXRob3JpemF0aW9uX2RlY2lzaW9uIjoiIiwiYXBwX2F6Zl9kb21haW4iOiIzclQ5d3NyOUVlaW9OZ0pDckJFQUFnIiwidXNlcm5hbWUiOiJhZG1pbiIsInR5cGUiOiJ1c2VyIiwiaWF0IjoxNTM5MDk1ODA2LCJleHAiOjE1MzkwOTk0MDZ9.-fYFHyPjPpA52gTEqMjppmERqiIZDgGKG5bJqVh0o68",
    "token_type":"jwt",
    "refresh_token":"a581cb04b116e26b175002bc2e05551042fafbda"
}
```

If "permanent" option is included in the request, the refresh token would not be
generate.
