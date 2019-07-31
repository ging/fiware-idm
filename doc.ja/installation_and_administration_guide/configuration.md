# 設定

Keyrock は、各ユースケースの特定のニーズに合わせて簡単に構成できる強力な
ツールです。主な構成は次のとおりです :

-   ホストとポート

-   デバッグ

-   HTTPS

-   セキュリティ (ユーザ・セッション、パスワードの暗号化と CORS)

-   OAuth2.0

-   eIDAS

-   使用制御 (Usage Control)

-   API

-   データベース

-   外部認証

-   認可

-   メール・サーバ

-   メール・フィルタリング

-   サイト (テーマ)

この設定はすべて環境変数を使って行うことができます。環境変数のリストを確認する
には、次のセクションに進みます。

config.js ファイルとは別に、UI には管理ユーザ・ビューがあり、そこからユーザを
簡単に管理できます。


## ホストとポート

これらは Keyrock の基本構成です。最初の設定は、HTTPS が有効になっていない場合に
どのポートで Keyrock がリッスンを行うかを指定することです。ホスト設定は、
プロダクションで Keyrock のドメイン名を示すことです。そうでなければ、開発時に
実行するときは `http://localhost:` に設定されるべきです。

```javascript
config.port = 80;
config.host = "http://keyrock-domain-name.org:" + config.port;
```

## デバッグ

この構成を有効にして、リソースのリクエストまたはデータベースで実行された
SQL ステートメントに関連したログを表示します。

```javascript
config.debug = true;
```

さらに、次のシェルコマンドを使用して、デバッグモードで Keyrock
を実行できます :

```bash
npm run debug
```

このコマンドを実行するには、[nodemon](https://nodemon.io/)
をインストールすることが必須です。これにより、コードが変更されるたびに
サーバが再起動します。

## HTTPS の有効化

サーバが HTTPS リクエストを受信できるようにするには、次の手順に
従ってください。

-   Generate OpenSSL certificates.

```bash
./generate_openssl_keys.sh
```

-   OpenSSL 証明書を生成します

```javascript
config.https = {
    enabled: true,
    cert_file: "certs/idm-2018-cert.pem",
    key_file: "certs/idm-2018-key.pem",
    port: 443
};
```

-   管理者権限でサーバを起動します

```bash
sudo npm start
```

## セキュリティ

HTTPS とは別に、セキュリティの処理に関連する他の3つの設定があります:

-   セッション管理。このパラメータは、UI 内のユーザ・セッションを暗号化する
    ためのキーとユーザ・セッションの期間を設定するために使用されます。
    セキュリティ上の理由から、サーバの再起動時にはいつでもランダム・キーを
    作成することをお勧めします。 例えば :

```javascript
config.session = {
    secret: require("crypto")
        .randomBytes(20)
        .toString("hex"),
    expires: 60 * 60 * 1000
};
```

-   パスワード暗号化。現在、ソルト・パスワード (salt password) は Keyrock
    でサポートされているため、このパラメータは将来非推奨になります。
    とにかく、これは、開発者がソルト・パスワードを使用しないことにした場合に
    備えてパスワードを暗号化するように設定することができます :

```javascript
config.password_encryption = {
    key: "idm_encryption"
};
```

-   CORS。これにより、Keyrock は、Keyrock のドメインとは異なる別のドメイン
    からのリクエストを管理できます。この設定を通じて、どの HTTP メソッドが
    許可されるのか、どのドメインからリクエストが来るのかなどを指定できます。
    これがデフォルトの CORS 設定です:

```javascript
config.cors = {
    enabled: true,
    options: {
        origin: "*",
        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
        allowedHeaders: undefined,
        exposedHeaders: undefined,
        credentials: undefined,
        maxAge: undefined,
        preflightContinue: false,
        optionsSuccessStatus: 204
    }
};
```

## OAuth2.0

Keyrock のいくつかの機能を設定できます。それらのほとんどはトークンの寿命に
関連しています。

-   認証コード (Authorization code)。アクセス・トークン、およびリフレッシュ・
    トークンの有効期間を簡単に変更できます。この値のいずれかを変更すると、
    Keyrock に登録されているすべてのサービスがこの新しい値で更新されます

-   認可を求める (Ask authorization)。General Data Protection Regulation
    (GDPR) により、クライアントはユーザ情報を取得するための同意を求めるように
    強制されます。実際には、このパラメータは常に true であるべきですが、false
    に設定すると便利な場合があります。たとえば、既存のユーザがすでに以前に
    同意したサービスが Keyrock を使用したいが、自分のユーザ・テーブルを
    使用してそれらのユーザを認証したい場合 (外部認証を参照)

-   固有のURL (Unique URL)。現在、Keyrock は同じ URL でサービスを登録することを
    許可しています。サービスに Sign-out Callback URL が含まれていない場合、
    Keyrock はサイン・アウトのリクエストを URL 属性に格納されているアドレスに
    リダイレクトします。そのため、一意の URL が有効になっていないと、
    リクエストのリダイレクトが正しくないためにサイン・アウトのプロセスが
    失敗する可能性があります

```javascript
config.oauth2 = {
    authorization_code_lifetime: 5 * 60,
    access_token_lifetime: 60 * 60,
    ask_authorization: true,
    refresh_token_lifetime: 60 * 60 * 24 * 14,
    unique_url: false
};
```

[OAuth2.0 による IdM への接続](../oauth/introduction.md) をチェックして、
この機能の詳細な説明を入手してください。

## eIDAS

[IdM と eIDAS　の接続](../eidas/introduction.md) をチェックして、この機能の
詳細な説明を入手してください。この設定例は次のとおりです :

```javascript
config.eidas = {
    enabled: true,
    gateway_host: "localhost",
    node_host: "https://se-eidas.redsara.es/EidasNode/ServiceProvider",
    metadata_expiration: 60 * 60 * 24 * 365
};
```

## 使用制御 (Usage Control)

この機能の詳細な説明を取得するには、
[data usage control section](https://fiware-idm.readthedocs.io/en/latest/usage_control/introduction/index.html)
を確認してください。 この設定例は次のとおりです :

```javascript
config.usage_control = {
    enabled: true,
    ptp: {
        host: "localhost",
        port: 8090
    }
};
```

## API

OAuth2.0 の設定と同様に、デプロイされた各 Keyrock インスタンスの個々の
ニーズに基づいて、API トークンの有効期間を短くしたり長くしたりできます。

独自のリソースを管理するための Keyrock の API はわずかに設定できます :

```javascript
config.api = {
    token_lifetime: 60 * 60
};
```

## データベース

データベース設定に関連して、変更可能ないくつかのパラメーターがあります :

-   ホスト。データベースが稼働しているマシンのドメイン名または IP です

-   ポート。設定されていない場合、割り当てられたポートは各 SQL 言語の
    デフォルトのものです。たとえば、MySQL はデフォルトで 3306 ポートを使用します

-   ユーザ名とパスワード。MySQL や　Postgres のように、データベースに対して
    アクションを実行する前にエンティティを認証する必要があるデータベースが
    あります

-   ダイアレクト (Dialect)。このパラメータは、どのタイプの SQL
    データベースを使用するかを示します


```javascript
config.database = {
    host: "localhost",
    password: "idm",
    username: "root",
    database: "idm",
    dialect: "mysql",
    port: undefined
};
```

## 外部認証 (External Authentication)

外部データベースを介してユーザを認証するように Identity Manager を
設定することもできます。

このオプションを使用すると、ユーザが自分のリモート・クレデンシャルを使用して
認証された後、ユーザのローカル・コピーが作成されます。ユーザを外部認証するために、
Keyrock は外部データベースからユーザ属性のセットを読み取る必要があります。
これらの属性は以下のとおりです :

-   id : ユーザの一意の識別子。ユーザのローカル・コピーには、構成された
    プレフィックス (_config.external_auth.id_prefix_) と外部 ID
    を連結した結果の識別子が付けられます

-   username：ユーザの表示名

-   email : メール・アドレスは、ユーザの認証に使用される値です

 -  password：ユーザの暗号化パスワード

 -  password_salt : 指定しない場合、
    `config.external_auth.password_encryption_key` に設定された値がパスワードの
    暗号化チェックに使用されます

外部データベースにこれらのパラメータを持つテーブルがないことは非常に一般的です。
そのような場合は、それらを公開するためのデータベース・ビューを作成できます。

外部データベースに、以下の構造を持つ _USERS_ と _ACTORS_ という2つのテーブルに
分けられたユーザ・データがあるとします :

**USERS テーブル**

```text
| ID  | encrypted_password | password_salt | created_at               | last_sign_in_at          | actor_id |
| --- | ------------------ | ------------- | ------------------------ | ------------------------ | -------- |
| 1   | g34h432hjk54k2j    | 1234          | 2015-06-10 08:26:02.0113 | 2018-06-10 08:26:02.0113 | 12       |
| 2   | 2h43h7fdj38302j    | 1234          | 2015-01-10 08:26:02.0113 | 2018-01-10 08:26:02.0113 | 22       |
| 3   | j328478j328j423    | 1234          | 2015-02-10 08:26:02.0113 | 2018-10-10 08:26:02.0113 | 5        |
```

**ACTORS テーブル**

```text
| ID  | name          | email           | logo                   |
| --- | ------------- | --------------- | ---------------------- |
| 12  | Melinda López | melinda@test.es | http://mylogo.es/12344 |
| 22  | Juanli Jons   | juanli@test.es  | http://mylogo.es/12121 |
| 5   | Lesha Magnen  | lesha@test.es   | http://mylogo.es/1212  |
```

SQL文で ビュー を作成できます

```sql
CREATE VIEW USER_VIEW AS
    SELECT USERS.id, USERS.password_salt, USERS.encrypted_password as password, ACTORS.email, ACTORS.name as username
    FROM USERS,ACTORS
    WHERE USERS.actor_id = ACTORS.id;
```

これにより、Keyrock がユーザを認証するために必要な構造のビューが
作成されます:

**USER_VIEW テーブル**

| ID  | password_salt | password        | email           | username      |
| --- | ------------- | --------------- | --------------- | ------------- |
| 1   | 1234          | g34h432hjk54k2j | melinda@test.es | Melinda López |
| 2   | 1234          | 2h43h7fdj38302j | juanli@test.es  | Juanli Jons   |
| 3   | 1234          | j328478j328j423 | lesha@test.es   | Lesha Magnen  |

この外部認証を有効にするには、データベースの属性をカスタマイズして
config.js ファイルを修正する必要があります。

```javascript
config.external_auth = {
    enabled: true,
    id_prefix: "external_",
    password_encryption_key: undefined,
    ecryption: "bcyrpt",
    database: {
        host: "localhost",
        port: undefined,
        database: "idm",
        username: "root",
        password: "idm",
        user_table: "user_view",
        dialect: "mysql"
    }
};
```

パスワードの有効性をチェックする方法は、_external_auth.encryption_
パラメータでカスタマイズできます。
SHA1 と BCrypt は現在サポートされています。

## 認可 (Authorization)

ポリシー決定ポイント (PDP : Policy Decision Point) の設定

-   IdM は基本的なポリシー・チェックを実行できます (HTTP 動詞 + パス)

-   AuthZForce は基本的なポリシー・チェックも高度なものも実行できます

認証レベルが高度な場合は、ルール、HTTP 動詞 + リソース、および 高度な XACMLを
作成できます。さらに、Pep Proxy からの高度な認可リクエストを実行するために
Authzforce のインスタンスをデプロイする必要があります。許可レベルが basic
の場合、作成できるのは HTTP 動詞+リソース規則のみです。

この機能を有効にするためには、設定ファイルを編集する必要があります :

```javascript
config.authorization = {
    level: "basic", // basic|advanced
    authzforce: {
        enabled: false,
        host: "localhost",
        port: 8080
    }
};
```

## メール

ユーザにメールを送信するように IdM を設定できます。
Ubuntu 14.04 で Postfix を送信専用 SMTP サーバとして設定するため、この
[チュートリアル](https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-postfix-as-a-send-only-smtp-server-on-ubuntu-14-04)
に従ってください。そして、設定ファイルを編集します :

```javascript
config.mail = {
    host: "idm_host",
    port: 25,
    from: "noreply@host"
};
```

## メール・フィルタリング

Keyrock で誰がサインアップしているかを制御するために、メール・ドメインフィルタを
設定することができます。2つの方法があります :

-   whitelist。Keyrock に登録できる有効なメール・ドメインを定義したリストです

-   blacklist。Keyrock への登録時にどのメール・ドメインをブロックするかを
    定義したリストです

どちらの方法を使用するか決めたら、/etc/email_list の下の対応するファイルに
入力する必要があります。これらのリストは1行にドメイン (@ なしで)を持つべきです。
たとえば、ホワイトリスト (whitelist) は次のようになります :

```txt
allow.com
valid.es
permit.com
```

このパラメータが null または未定義に設定されている場合、電子メールの
メール・フィルタは実行されません。 設定例 :

```javascript
config.email_list_type = "whitelist";
```

## テーマの設定

Web ポータルの外観をカスタマイズすることができます。デフォルトでは、
default と fiwarelab の2つのテーマがあります。

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/AdminGuide_default_view.png)

<p align="center">図1: IdM default ビュー</p>

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/AdminGuide_fiware_view.png)

<p align="center">図2: IdM fiware ビュー</p>

これらのテーマは config.js で変更できます :

```javascript
config.site = {
    title: "Identity Manager",
    theme: "default" // default/fiwarelab
};
```

さらにあなたはあなた自身のテーマをカスタマイズすることができます。
それをするためにはこれらのステップに従って下さい :

-   themes ディレクトリに新しいサブフォルダを作成します

```bash
mkdir themes/example
```

-   \_colors.scss, \_styles.scss と style.scss を作成します

```bash
cd themes/example && touch _colors.scss _styles.scss style.scss
```

-   style.scss にこれらのリンクを追加します

```css
/****************************** Default colors */
@import "../default/colors";

/****************************** Custom colors */
@import "colors";

/****************************** Default styles */
@import "../default/styles_call";

/****************************** Custom styles */
@import "styles";
```

-   \_colors.scss を編集します。たとえば :

```css
/****************************** Custom colors rewrite */

$brand-primary: purple;
$brand-secundary: orange;
```

-   新しいテーマを使用するように config.site を変更してください。:

```javascript
config.site = {
    title: "Identity Manager",
    theme: "example" // default/fiwarelab
};
```

Keyrock をもう一度実行して、新しい外観を確認してください :

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/AdminGuide_customize_view.png)

<p align="center">図3: IdM カスタム・ビュー</p>

\_styles.scss に新しいロゴを設定することもできます

```css
/****************************** Custom styles rewrite */

.logo-header .brand {
    background-image: url(../img/example.png);
    width: 150px;
    background-size: 150px 37px;
}

.logo-header {
    float: left;
}

.presentation {
    .media {
        height: auto;
        footer {
            margin-top: 15px;
        }
    }
}
```

さらに、ポータルのヘッダ、フッタ、プレゼンテーション、およびヘルプを
カスタマイズできます。これを行うには、フォルダを作成し、ファイルを
生成してからそれらをカスタマイズします。

```bash
mkdir themes/example/templates
cd themes/example/templates && touch _footer.ejs _header.ejs _presentation.ejs _help_about_items.ejs
```

## 管理パネル

Keyrock は、管理者がユーザ・アカウントを簡単に管理できるインターフェースを
提供します。ユーザの作成、編集、削除、有効化、およびパスワードのリセット
などのアクションは、この機能を通じて実行できます。

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/AdminGuide_admin_panel.png)
