# クイック・スタート・ガイド

クイックスタートガイド

IdM Keyrock スタート・ガイドへようこそ。このガイドでは、Keyrock の基礎となる
基本を学びます。サービスへの認証と認可を可能にするための OAuth
トークンを生成します。

まず最初に、Keyrock インスタンスをデプロイする必要があります。Keyrock を
インストールする最も簡単な方法は Docker と Docker Compose を使うことです。
docker-compose.yml ファイルを作成し、それに以下の内容をコピーします :

```yaml
version: "2"

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
            - "3306:3306"
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
            - "3000:3000"
            - "443:443"
        networks:
            idm_network:
                ipv4_address: 172.18.1.6
        environment:
            - IDM_DB_HOST=mysql
```

その後、docker-compose.yml ファイルを作成したディレクトリに移動して
以下を実行します :

```bash
docker-compose up
```

これにより2つの Docker コンテナがデプロイされます : 1つは IdM Keyrock
用、もう1つはデータベースインスタンス用です (この場合は MySQL です)。
データベースには、クレデンシャルが次のように設定された
デフォルト・ユーザがシードされます :

-   Email: admin@test.com

-   Password: 1234

OAuth トークンを作成するには、まず Keyrock にアプリケーションを登録する
必要があります。
[アプリケーションの登録](user_and_programmers_guide/application_guide.md#register-an-application)
で説明されているように、UI (以前のユーザのクレデンシャルを使用して
[サインイン](user_and_programmers_guide/user_guide.md#sign-in)
)を使用してそれを実行できます。または、API を通じて作成することもできます。
(このガイドでは curl コマンドを使用しますが、
[apiary](https://keyrock.docs.apiary.io/#reference/keyrock-api/authentication)
では他のプログラミング言語でこの認証を実行する方法を見つけることができます) :

&nbsp;&nbsp;1\. API トークンを生成 :

&nbsp;&nbsp;&nbsp;&nbsp;1.1\. デフォルト・ユーザのクレデンシャルを使用してリクエスト

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

&nbsp;&nbsp;&nbsp;&nbsp;1.2\. レスポンスとして X-Subject-Header から API トークンを取得
(このケースでは、04c5b070-4292-4b3f-911b-36a103f3ac3f):

```bash
Content-Type:application/json,application/json; charset=utf-8
X-Subject-Token:04c5b070-4292-4b3f-911b-36a103f3ac3f
Content-Length:74
ETag:W/"4a-jYFzvNRMQcIZ2P+p5EfmbN+VHcw"
Date:Mon, 19 Mar 2018 15:05:35 GMT
Connection:keep-alive
```

&nbsp;&nbsp;2\. 以前に作成した API トークンを使用してアプリケーションを作成 :

&nbsp;&nbsp;&nbsp;&nbsp;2.1\. リクエスト (redirect_uri が
`http://localhost/login` であることを確認してください):

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

&nbsp;&nbsp;&nbsp;&nbsp;2.2\. アプリケーション情報を含む応答の例。
後で OAuth トークンを取得するために使用する ID と secret を保存します。

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

これで、OAuth トークンを作成する準備がすべて整いました。 この場合は、リソース・
オーナー・パスワードのクレデンシャル・フローを使用してトークンを生成します。
前のステップで取得した独自の値 (application.ID と application.secreti)
を使用して、2つの環境変数 (ID と SECRET) を作成する必要があります。

```bash
ID=a17bf9e3-628d-4000-8d25-37703975a528
SECRET=ac5df1fe-4caf-4ae6-9d21-60f3a9182887
curl -X POST -H "Authorization: Basic $(echo -n $ID:$SECRET | base64 -w 0)"   --header "Content-Type: application/x-www-form-urlencoded" -d "grant_type=password&username=admin@test.com&password=1234" http://localhost:3000/oauth2/token

```

レスポンスのボディでは、"access_token" パラメータに OAuth
トークンがあります :

```json
{
    "access_token": "cd8c8e41ab0db220315ed54f173087d281a4c686",
    "token_type": "Bearer",
    "expires_in": 3599,
    "refresh_token": "8b96bc9dfbc8f1c0bd53e18720b6feb5b47de661",
    "scope": ["bearer"]
}
```

最後に、トークンを生成したユーザに関する情報を取得することができます :

```bash
curl "http://localhost:3000/user?access_token=cd8c8e41ab0db220315ed54f173087d281a4c686"
```

そして、Keyrock は、以下を送信します :

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
