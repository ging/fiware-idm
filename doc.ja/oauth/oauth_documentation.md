# イントロダクション

`Authorization Basic` ヘッダは、[標準](http://tools.ietf.org/html/rfc2617)
に従ったFIWARE IdM によって提供される `Client ID` と `Client Secret`
クレデンシャル情報で構成されています。文字列は次のようになります :


```bash
base64(client_id:client_secret)
```

`redirect_uri` パラメータは、アプリケーション登録で指定された
`Callback URL` 属性と一致する必要があります。

## 認可コードの付与 (Authorization Code Grant)

認可コードは、クライアント (登録アプリケーション) とリソース所有者 （ユーザ）
との間の仲介として認可サーバ (IdM） を使用して取得されます。リソース所有者から
直接、認可をリクエストするのではなく、クライアントはリソース・オーナを
[RFC2616](http://tools.ietf.org/html/rfc2616>) で定義されたユーザ・エージェントを
介して、認可サーバに指示し、リソースオーナーは認証コードを使用してクライアントに
返送します。

### 認可リクエスト (Authorization Request)

```bash
GET /oauth2/authorize?response_type=code&client_id=1&state=xyz
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url HTTP/1.1
Host: idm-portal
```

`response_type` 属性は必須であり、`code` に設定する必要があります。`client_id`
属性は、アプリケーションの登録時に FIWARE のIdM が提供するものです。`redirect_uri`
属性は、アプリケーション登録内の IDM に提供する `Callback URL` 属性に一致しなければ
なりません。`state` は、オプションで、アプリケーションの内部使用のためのものです。


### 永久トークンの認可リクエスト (Authorization Request For Permanent Token)

```bash
GET /oauth2/authorize?response_type=code&client_id=1&state=xyz
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url&scope=permanent HTTP/1.1
Host: idm-portal
```

### 認可レスポンス (Authorization Response)

```bash
HTTP/1.1 302 Found
Location: https://client.example.com/callback_url?code=SplxlOBeZQQYbYS6WxSbIA&state=xyz
```

<a name="#access-token-response"></a>
### アクセス・トークンのリクエスト (Access Token Request)

```bash
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=SplxlOBeZQQYbYS6WxSbIA
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url
```

### アクセス・トークンのレスポンス (Access Token Response)

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

### 暗黙のグラント (Implicit Grant)

暗黙のグラントは、JavaScript などのスクリプト言語を使用してブラウザに実装された
クライアント用に最適化された単純化された認証コード・フローです。暗黙のフローでは、
クライアントに認証コードを発行するのではなく、リソース所有者の許可の結果として、
クライアントに直接アクセス・トークンが発行されます。中間の資格情報
(認証コードなど) が発行されず、後でアクセス・トークンを取得するために使用される
ので、グラント・タイプは暗黙的です。

### 認可リクエスト (Authorization Request)

```bash
GET /oauth2/authorize?response_type=token&client_id=1&state=xyz
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url HTTP/1.1
Host: idm-portal
```

`response_type` 属性は必須であり、`token` に設定する必要があります。

`client_id` 属性は、アプリケーションの登録時に FIWARE の IdM が提供するものです。

`redirect_uri` 属性は、アプリケーション登録内の IDM に提供する `Callback URL`
属性に一致しなければなりません。

`state` はオプションで、アプリケーションの内部使用のためのものです。


### 永久トークンの認可リクエスト (Authorization Request For Permanent Token)

```bash
GET /oauth2/authorize?response_type=token&client_id=1&state=xyz
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url&scope=permanent HTTP/1.1
Host: idm-portal
```

### アクセス・トークンのレスポンス (Access Token Response)

```bash
HTTP/1.1 302 Found
Location: https://client.example.com/callback_url?token=SplxlOBeZQQYbYS6WxSbIA&token_type=Bearer&expires_in=3600&state=xyz&
```

##  リソース・オーナーのパスワード・クレデンシャル・グラント

リソース・オーナーのパスワード・クレデンシャル (つまり、ユーザ名とパスワード)
は、アクセス・トークンを取得するための認可グラントとして直接使用できます。


### アクセス・トークンのリクエスト (Access Token Request)

```bash
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=password&username=demo&password=123
```

### 永久トークン・リクエスト (Permanent Token Request)

```bash
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=password&username=demo&password=123&scope=permanent
```

### アクセス・トークンのレスポンス (Access Token Response)

[認可コード・グラント](#access-token-response) を参照してください。

## リフレッシュ・トークンのグラント (Refresh Token Grant)

クライアントは、クライアント・クレデンシャル・グラント・タイプ以外の
別のグラント・タイプによって初めて取得したリフレッシュ・トークンを使用して、
新しいトークンをリクエストできます。

### アクセス・トークンのリクエスト (Access Token Request)

```bash
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&refresh_token=tGzv3JOkF0XG5Qx2TlKWIA
```

### 永久トークン・リクエスト (Permanent Token Request)

```bash
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&refresh_token=tGzv3JOkF0XG5Qx2TlKWIA&scope=permanent
```

### アクセス・トークンのレスポンス (Access Token Response)

[認可コード・グラント](#access-token-response) を参照してください。

## クライアント・クレデンシャル・グラント (Client Credentials Grant)

クライアントは、クライアント・クレデンシャルのみを使用してアクセス・トークンを
リクエストできます。


### アクセス・トークンのリクエスト (Access Token Request)

```bash
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
```

### 永久トークン・リクエスト (Permanent Token Request)

```bash
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&scope=permanent
```

### アクセス・トークンのレスポンス (Access Token Response)

[認可コード・グラント](#access-token-response) を参照してください。

## アクセストークンの検証 (Validate Access Tokens)

ユーザに関連付けられた OAuth2.0 アクセス・トークンを作成したら、それを検証して
ユーザ情報とロールを取得できます。さらに、
[PDP として Keyrock](../installation_and_administration_guide/configuration.md#authorization)
を設定している場合は、ユーザがアプリケーション内で特定のアクションを実行すること
が認可されているかどうかを確認するために同じエンドポイントを使用できます。

**警告**

> トークンを取得するためにクライアント・クレデンシャル・グラントを使用した場合は、
> この認可の性質上、'認可ユーザ'のようなものはありません。このエンドポイントを
> 使用してトークンを検証することはできますが、JSON (トークンが有効な場合) は
> 空になります。

## トークンの取り消し (Revoke Token)

トークンを無効にするには、次のリクエストを送信する必要があります :

```bash
POST /oauth2/revoke HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

token=2YotnFZFEjr1zCsicMWpAA&token_type_hint=access_token
```

リフレッシュ・トークンまたはアクセス・トークンのいずれかを取り消すことができます。
リフレッシュ・トークンの場合、これに関連付けられているすべてのアクセス・トークン
が取り消されます。

token_type_hint はオプションであり、取り消そうとしているトークンのタイプに応じて
"access_token" または "refresh_token" の値を持つことができます。これらの値は、
Keyrock がトークンを迅速に取り消すのに役立ちます。

## ユーザ情報とロールの取得

リクエスト :

```bash
GET /user?access_token=2YotnFZFEjr1zCsicMWpAA
```

レスポンスの例 :

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

## 認可の検証 (Validate authorization）

[PDP としての Keyrock](../installation_and_administration_guide/configuration.md#authorization)
を設定した場合は、アプリケーションのスコープ内の特定のリソースに対して特定のアクションを
実行する権限がユーザに与えられているかどうかを確認するために同じエンドポイントを使用できます。

ユーザー情報のレスポンス応答には、認可に関する決定が含まれます。

リクエスト :

```bash
GET /user?access_token=2YotnFZFEjr1zCsicMWpAA&action=GET&resource=myResource&app_id=ea3edd2e-2220-4489-af7d-6d60fffb7d1a
```

レスポンスの例 :

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

## トークン・タイプの選択

Keyrock IdM を使用すると、OAuth リクエストを受信したときに生成されるトークンの
種類を選択できます。 デフォルトでは、アプリケーションは "Bearer Token"
を作成しますが、[JSON Web トークン](https://tools.ietf.org/html/rfc7519)
を生成するように設定することもできます。前のセクションで説明したように、
永続的なトークン (Bearer または JWT) を生成するように設定することもできます。
これらの永久トークンは期限切れになることはありません。次の図に示すように、
これらのトークン・タイプのオプションはインターフェイスで選択できます。

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_SelectTokenType.png)

<p align="center">図1: トークン・タイプの選択</p>

JWT は、2者間で一連の情報を表現するための安全な方法です。JWT は、ヘッダ、ペイロード、
およびドットで区切られた署名で構成されています。JWT に関するより多くの情報は、
この[リンク](https://jwt.io/)で見つけることができます。JWT が選択されている場合、
トークンを検証してユーザ情報を取得するためにシークレット (secret) が提供されます。

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_TokenTypeJwt.png)

<p align="center">Figure 2: JSON Web Token type</p>

### JWT によるアクセス・トークンのリクエスト(Access Token Request with JWT)

JWT の生成は、リクエスト内の scope オプションを介して実行できます。

-   認可コード・グラントと暗黙のグラントは、クエリ・パラメータとして URL に含める
    必要があります。 例えば、認可コード・リクエストでは :

```bash
GET /oauth2/authorize?response_type=code&client_id=1&state=xyz
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url&scope=jwt HTTP/1.1
Host: idm-portal
```

-   残りのグラントでは、リクエストのボディに含まれるべきです。たとえば、
    リソース・オーナー・パスワード・クレデンシャルのリクエストでは、
    次のようになります :

```bash
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=password&username=demo&password=123&scope=jwt
```

永続的なJWTを生成するには、リクエストの scope に jwt と permanent の両方を
含める必要があります。

-   許可コード・グラントおよび暗黙のグラントの場合 :

```bash
GET /oauth2/authorize?response_type=code&client_id=1&state=xyz
&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcallback_url&scope=jwt,permanent HTTP/1.1
Host: idm-portal
```

-   その他のグラントの場合 :

```bash
POST /oauth2/token HTTP/1.1
Host: idm-portal
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
Content-Type: application/x-www-form-urlencoded

grant_type=password&username=demo&password=123&scope=jwt,permanent
```

### アクセス・トークンのレスポンス (Access Token Response)

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

リクエストに "permanent" オプションが含まれていると、リフレッシュ・トークンは
生成されません。
