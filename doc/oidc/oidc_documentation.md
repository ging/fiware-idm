# Introduction

The `Authorization Basic` header is built with the `Client ID` and
`Client Secret` credentials provided by the FIWARE IdM following the
[standard](http://tools.ietf.org/html/rfc2617). So the string will be

```bash
base64(client_id:client_secret)
```

The `redirect_uri` parameter must match the `Callback URL` attribute provided in
the application registration.

## OIDC over Authorization Code Flow

The Authorization Code flow can be adapted to support authentication mechanisms.
OIDC does not modify the flow of the authorization code itself but simply adds a
parameter to the request to the Authorization endpoint as we will see below. The
response returns an access-code which can be exchanged for an id_token which
then identifies the user.

### Authorization Request

```bash
GET /oauth2/authorize?response_type=code&client_id=1&state=xyz
&scope=openid&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url HTTP/1.1
Host: idm-portal
```

The query parameters required are the same as those required for the OAuth 2.0
authorization code grant. In addition to these, OIDC requests MUST contain the
openid scope value. If openid is not present, the request will be handled as an
OAuth 2.0 request.

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
    "id_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdhbml6YXRpb25zIjpbXSwiZGlzcGxheU5hbWUiOiIiLCJyb2xlcyI6W10sImFwcF9pZCI6IjNjYzE2NTM4LThiOTYtNGE3Ny1iMDY3LWQwMTZhNTI5ZmNjMyIsInRydXN0ZWRfYXBwcyI6W10sImlzR3JhdmF0YXJFbmFibGVkIjpmYWxzZSwiaW1hZ2UiOiIiLCJlbWFpbCI6ImFkbWluQHRlc3QuY29tIiwiaWQiOiJhZG1pbiIsImF1dGhvcml6YXRpb25fZGVjaXNpb24iOiIiLCJhcHBfYXpmX2RvbWFpbiI6IiIsImVpZGFzX3Byb2ZpbGUiOnt9LCJhdHRyaWJ1dGVzIjp7fSwidXNlcm5hbWUiOiJhZG1pbiIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwNSIsInN1YiI6ImFkbWluIiwiYXVkIjoiM2NjMTY1MzgtOGI5Ni00YTc3LWIwNjctZDAxNmE1MjlmY2MzIiwiZXhwIjoxNTk0MjA0MzcyLCJpYXQiOjE1OTQyMDA3NzIsImF0X2hhc2giOiIwWlJ2R1JlRlFnM3RRa2oxZERyMktBPT0ifQ.Q-nSH5YthDY7ljNa9_5-4CtKOuqHYSsNr0Rb0ppd4os",
    "token_type":"jwt"
}
```

## OIDC over Implicit Flow

The Implicit flow can also be adapted to support authentication mechanisms. As
well as in the authorization code grant, OIDC does not modify the flow but
changes the response_type of the requests. This flow returns an id_token
directly rather than returning an interim access-code. This is less secure than
the Authcode flow but can be used in some client-side applications

### Authorization Request

```bash
GET /oauth2/authorize?response_type=id_token&client_id=1&state=xyz
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url HTTP/1.1
Host: idm-portal
```

The `response_type` attribute is mandatory and must be set to `id_token`.

The `client_id` attribute is the one provided by the FIWARE IdM upon application
registration.

The `redirect_uri` attribute must match the `Callback URL` attribute provided to
the IdM within the application registration.

`state` is optional and for internal use of you application, if needed.

### Access Token Response

```bash
HTTP/1.1 302 Found
Location: https://client.example.com/callback_url?id_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdhbml6YXRpb25zIjpbXSwiZGlzcGxheU5hbWUiOiIiLCJyb2xlcyI6W10sImFwcF9pZCI6IjNjYzE2NTM4LThiOTYtNGE3Ny1iMDY3LWQwMTZhNTI5ZmNjMyIsInRydXN0ZWRfYXBwcyI6W10sImlzR3JhdmF0YXJFbmFibGVkIjpmYWxzZSwiaW1hZ2UiOiIiLCJlbWFpbCI6ImFkbWluQHRlc3QuY29tIiwiaWQiOiJhZG1pbiIsImF1dGhvcml6YXRpb25fZGVjaXNpb24iOiIiLCJhcHBfYXpmX2RvbWFpbiI6IiIsImVpZGFzX3Byb2ZpbGUiOnt9LCJhdHRyaWJ1dGVzIjp7fSwidXNlcm5hbWUiOiJhZG1pbiIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwNSIsInN1YiI6ImFkbWluIiwiYXVkIjoiM2NjMTY1MzgtOGI5Ni00YTc3LWIwNjctZDAxNmE1MjlmY2MzIiwiZXhwIjoxNTk0MjA0NjAwLCJpYXQiOjE1OTQyMDEwMDB9.4zd2dgoxyhU93QlhEVXXUMYaKLju8e0TZwlis_nvazc&state=xyz
```

## OIDC over Hybrid Flow

The Hybrid flow combines the authorization code and the implicit grant. It could
be useful to parallelize process in the frontend and the backend of
applications. The flow is similar to the authorization code grant but in this
case tokens are generated in both authorization and token endpoint.

### Authorization Request

```bash
GET /oauth2/authorize?response_type=code id_token token&client_id=1&scope=openid&state=xyz
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url HTTP/1.1
Host: idm-portal
```

The `response_type` must be set to `code id_token token` to procces the requests
through the Hybryd flow.

The `client_id` attribute is the one provided by the FIWARE IdM upon application
registration.

The `redirect_uri` attribute must match the `Callback URL` attribute provided to
the IdM within the application registration.

`state` is optional and for internal use of you application, if needed.

In addition to these, OIDC requests COULD contain the openid scope value. If
openid is present, the code generated is exchanged for an id_token.

### Access Token Response

```bash
HTTP/1.1 302 Found
Location: https://client.example.com/callback_url?id_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdhbml6YXRpb25zIjpbXSwiZGlzcGxheU5hbWUiOiIiLCJyb2xlcyI6W10sImFwcF9pZCI6IjNjYzE2NTM4LThiOTYtNGE3Ny1iMDY3LWQwMTZhNTI5ZmNjMyIsInRydXN0ZWRfYXBwcyI6W10sImlzR3JhdmF0YXJFbmFibGVkIjpmYWxzZSwiaW1hZ2UiOiIiLCJlbWFpbCI6ImFkbWluQHRlc3QuY29tIiwiaWQiOiJhZG1pbiIsImF1dGhvcml6YXRpb25fZGVjaXNpb24iOiIiLCJhcHBfYXpmX2RvbWFpbiI6IiIsImVpZGFzX3Byb2ZpbGUiOnt9LCJhdHRyaWJ1dGVzIjp7fSwidXNlcm5hbWUiOiJhZG1pbiIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwNSIsInN1YiI6ImFkbWluIiwiYXVkIjoiM2NjMTY1MzgtOGI5Ni00YTc3LWIwNjctZDAxNmE1MjlmY2MzIiwiZXhwIjoxNTk0MjA0NjAwLCJpYXQiOjE1OTQyMDEwMDB9.4zd2dgoxyhU93QlhEVXXUMYaKLju8e0TZwlis_nvazc&state=xyz&code=6987825d204b88d4310aa04c386581f5444e78ea&token=44a5bdf6997aa1dce2c0ab3e96ca00ef92813fad&token_type=bearer&expires_in=3600
```

### Access Token Request

```bash
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=hybrid&code=SplxlOBeZQQYbYS6WxSbIA
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url
```

### Access Token Response

```bash
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store
Pragma: no-cache

{ access_token: '810030c50902f046fc73a69f15dc0e9270318efe',
  token_type: 'bearer',
  id_token:
   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdhbml6YXRpb25zIjpbXSwiZGlzcGxheU5hbWUiOiIiLCJyb2xlcyI6W10sImFwcF9pZCI6IjNjYzE2NTM4LThiOTYtNGE3Ny1iMDY3LWQwMTZhNTI5ZmNjMyIsInRydXN0ZWRfYXBwcyI6W10sImlzR3JhdmF0YXJFbmFibGVkIjpmYWxzZSwiaW1hZ2UiOiIiLCJlbWFpbCI6ImFkbWluQHRlc3QuY29tIiwiaWQiOiJhZG1pbiIsImF1dGhvcml6YXRpb25fZGVjaXNpb24iOiIiLCJhcHBfYXpmX2RvbWFpbiI6IiIsImVpZGFzX3Byb2ZpbGUiOnt9LCJhdHRyaWJ1dGVzIjp7fSwidXNlcm5hbWUiOiJhZG1pbiIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwNSIsInN1YiI6ImFkbWluIiwiYXVkIjoiM2NjMTY1MzgtOGI5Ni00YTc3LWIwNjctZDAxNmE1MjlmY2MzIiwiZXhwIjoxNTk0MjA0OTg1LCJpYXQiOjE1OTQyMDEzODV9.eq5zEqKYRZdT1v1DrvJNvSIHqFOJUtqhh-ZIdfM-Pnw',
  expires_in: 3599,
  refresh_token: '9c49c69cc9fb9811d32a0c75985186bb5def37f3',
  scope: [ 'openid' ] }
```

## Validate ID Tokens

Once you have created an ID Token associated to a user, you can validate it
using the secret associated to the application. Finally, the payload of the id
token could be decoded in order to obtain the following information:

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
      "username": "myuser",
      "iss":"http://localhost:3005",
      "sub":"admin",
      "aud":"3cc16538-8b96-4a77-b067-d016a529fcc3",
      "exp":1594204985,
      "iat":1594201385
    }
```
