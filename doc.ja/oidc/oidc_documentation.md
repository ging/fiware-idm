# イントロダクション

`Authorization Basic` ヘッダは、[標準](http://tools.ietf.org/html/rfc2617)
に従って FIWARE IdM によって提供される `Client ID` および `Client Secret`
のクレデンシャルを使用して構築されます。したがって、文字列は

```bash
base64(client_id:client_secret)
```

`redirect_uri` パラメータは、アプリケーション登録で提供される `Callback URL`
属性と一致する必要があります。

## 認可コード・フロー (Authorization Code Flow) を介した OIDC

認可コード・フロー  (Authorization Code Flow)  は、認証メカニズムをサポートする
ように調整できます。OIDC は認可コード自体のフローを変更しませんが、
以下に示すように、認証エンドポイントへのリクエストにパラメータを追加するだけです。
レスポンスは、ユーザを識別する id_token と交換できるアクセス・コードを返します。

### 認可リクエスト (Authorization Request)

```bash
GET /oauth2/authorize?response_type=code&client_id=1&state=xyz
&scope=openid&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url HTTP/1.1
Host: idm-portal
```
必要なクエリ・パラメータは、OAuth 2.0 認可コード・グラント (authorization code grant)
に必要なものと同じです。これらに加えて、OIDC リクエストには openid スコープ値を含める
必要があります。openid が存在しない場合、リクエストは OAuth 2.0 リクエストとして処理されます。

### 認可レスポンス (Authorization Response)

```bash
HTTP/1.1 302 Found
Location: https://client.example.com/callback_url?code=SplxlOBeZQQYbYS6WxSbIA&state=xyz
```

### アクセス・トークン・リクエスト (Access Token Request)

```bash
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=SplxlOBeZQQYbYS6WxSbIA
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url
```

### アクセス・トークン・レスポンス (Access Token Response)

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

## 暗黙的なフロー (Implicit Flow) を介した OIDC

暗黙的なフロー (Implicit Flow) は、認証メカニズムをサポートするように適合させる
こともできます。OIDC は、認可コード・グラント (authorization code grant)
と同様に、フローを変更せずに、リクエストの response_type を変更します。
このフローは、暫定的なアクセス・コード (an interim access-code) を返すのではなく、
id_token を直接返します。これは、認可コード・フローほど安全ではありませんが、
一部のクライアント・サイドのアプリケーションで使用できます

### 認可リクエスト (Authorization Request)

```bash
GET /oauth2/authorize?response_type=id_token&client_id=1&state=xyz
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url HTTP/1.1
Host: idm-portal
```

`response_type` 属性は必須であり、`id_token` に設定する必要があります。

`client_id` 属性は、アプリケーション登録時に FIWARE IdM によって提供されるものです。

`redirect_uri` 属性は、アプリケーション登録内で IdM に提供される
`Callback URL` 属性と一致する必要があります。

`state` はオプションであり、必要に応じてアプリケーションを内部で使用するためのものです。

### アクセス・トークン・レスポンス (Access Token Response)

```bash
HTTP/1.1 302 Found
Location: https://client.example.com/callback_url?id_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdhbml6YXRpb25zIjpbXSwiZGlzcGxheU5hbWUiOiIiLCJyb2xlcyI6W10sImFwcF9pZCI6IjNjYzE2NTM4LThiOTYtNGE3Ny1iMDY3LWQwMTZhNTI5ZmNjMyIsInRydXN0ZWRfYXBwcyI6W10sImlzR3JhdmF0YXJFbmFibGVkIjpmYWxzZSwiaW1hZ2UiOiIiLCJlbWFpbCI6ImFkbWluQHRlc3QuY29tIiwiaWQiOiJhZG1pbiIsImF1dGhvcml6YXRpb25fZGVjaXNpb24iOiIiLCJhcHBfYXpmX2RvbWFpbiI6IiIsImVpZGFzX3Byb2ZpbGUiOnt9LCJhdHRyaWJ1dGVzIjp7fSwidXNlcm5hbWUiOiJhZG1pbiIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwNSIsInN1YiI6ImFkbWluIiwiYXVkIjoiM2NjMTY1MzgtOGI5Ni00YTc3LWIwNjctZDAxNmE1MjlmY2MzIiwiZXhwIjoxNTk0MjA0NjAwLCJpYXQiOjE1OTQyMDEwMDB9.4zd2dgoxyhU93QlhEVXXUMYaKLju8e0TZwlis_nvazc&state=xyz
```

## ハイブリッド・フロー (Hybrid Flow) を介した OIDC

ハイブリッド・フロー (Hybrid Flow) は、認可コードと暗黙的なグラントを組み合わせます。
アプリケーションのフロント・エンドとバック・エンドでプロセスを並列化すると便利です。
フローは認可コード・グラントに似ていますが、この場合、トークンは認可とトークンの
エンドポイントの両方で生成されます。

### 認可リクエスト (Authorization Request)

```bash
GET /oauth2/authorize?response_type=code id_token token&client_id=1&scope=openid&state=xyz
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url HTTP/1.1
Host: idm-portal
```

ハイブリッド・フローを介してリクエストを処理するには、`response_type` を
`code id_token token` に設定する必要があります。

`client_id` 属性は、アプリケーション登録時に FIWARE IdM によって提供されるものです。

`redirect_uri` 属性は、アプリケーション登録内で IdM に提供される
`Callback URL` 属性と一致する必要があります。

`state` はオプションであり、必要に応じてアプリケーションを内部で使用するためのものです。

これらに加えて、OIDC リクエストには、openid スコープ値を含めることができます。
openid が存在する場合、生成されたコードは id_token と交換されます。

### 認可レスポンス (Authorization Response)

```bash
HTTP/1.1 302 Found
Location: https://client.example.com/callback_url?id_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdhbml6YXRpb25zIjpbXSwiZGlzcGxheU5hbWUiOiIiLCJyb2xlcyI6W10sImFwcF9pZCI6IjNjYzE2NTM4LThiOTYtNGE3Ny1iMDY3LWQwMTZhNTI5ZmNjMyIsInRydXN0ZWRfYXBwcyI6W10sImlzR3JhdmF0YXJFbmFibGVkIjpmYWxzZSwiaW1hZ2UiOiIiLCJlbWFpbCI6ImFkbWluQHRlc3QuY29tIiwiaWQiOiJhZG1pbiIsImF1dGhvcml6YXRpb25fZGVjaXNpb24iOiIiLCJhcHBfYXpmX2RvbWFpbiI6IiIsImVpZGFzX3Byb2ZpbGUiOnt9LCJhdHRyaWJ1dGVzIjp7fSwidXNlcm5hbWUiOiJhZG1pbiIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwNSIsInN1YiI6ImFkbWluIiwiYXVkIjoiM2NjMTY1MzgtOGI5Ni00YTc3LWIwNjctZDAxNmE1MjlmY2MzIiwiZXhwIjoxNTk0MjA0NjAwLCJpYXQiOjE1OTQyMDEwMDB9.4zd2dgoxyhU93QlhEVXXUMYaKLju8e0TZwlis_nvazc&state=xyz&code=6987825d204b88d4310aa04c386581f5444e78ea&token=44a5bdf6997aa1dce2c0ab3e96ca00ef92813fad&token_type=bearer&expires_in=3600
```

### アクセス・トークン・リクエスト (Access Token Request)

```bash
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=hybrid&code=SplxlOBeZQQYbYS6WxSbIA
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url
```

### アクセス・トークン・レスポンス (Access Token Response)

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

## ID Tokens を検証

ユーザに関連付けられた ID Token を作成したら、アプリケーションに関連付けられた
シークレットを使用してそれを検証できます。最後に、次の情報を取得するために、
ID Token のペイロードをデコードできます:

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
