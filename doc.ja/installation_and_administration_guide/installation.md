# システム・インストール

このセクションでは、Identity Manager Keyrock をインストールする 2 つの方法につい
て説明します :

-   ホスト・インストール。これは目的の開発のために使われるべきです

-   Docker インストール。これはこのツールをテストするために使用できます

## ホスト・インストール

### 要件

Keyrock を実行するには、以下のソフトウェアを事前にインストールしておく必要があり
ます :

-   [Node.js](http://nodejs.org/download).

-   [Node Packaged Modules](https://npmjs.org). これは、通常、Node.js に含まれて
    います

-   [MySQL](https://www.mysql.com).

### インストール

Keyrock を起動して実行するには、以下の手順を実行する必要があります :

&nbsp;&nbsp;1\. [GitHub](http://github.com/ging/fiware-idm). を使用して、ソフト
ウェアをダウンロードしてください

```bash
    git clone https://github.com/ging/fiware-idm
```

&nbsp;&nbsp;2\. npm を使って必要なライブラリをすべてインストールします

```bash
cd fiware-idm
npm install
```

&nbsp;&nbsp;3\. インストールを設定します。 Keyrock を設定するには、
config.js.template という名前のファイルを config.js にコピーします

```bash
cp config.js.template config.js
```

&nbsp;&nbsp;対応する基本情報で編集してください。 以下に例があります :

&nbsp;&nbsp;&nbsp;&nbsp;3.1\. ポートとホストを設定します:

```javascript
config.host = 'http://localhost:3000';
config.port = 3000;
```

&nbsp;&nbsp;&nbsp;&nbsp;3.2\. データベースを設定します :

```javascript
config.database = {
    host: 'localhost',
    password: 'idm',
    username: 'root',
    database: 'idm',
    dialect: 'mysql'
};
```

&nbsp;&nbsp;&nbsp;&nbsp;3.3\. セッション・キーを設定します :

```javascript
config.session = {
    secret: 'nodejs_idm'
};
```

&nbsp;&nbsp;&nbsp;&nbsp;3.4\. パスワード暗号化を設定します :

```javascript
config.password_encryption = {
    key: 'nodejs_idm'
};
```

&nbsp;&nbsp;4\. データベースを作成し、マイグレーションとシーダーを実行します :

```bash
npm run-script create_db
npm run-script migrate_db
npm run-script seed_db
```

&nbsp;&nbsp;5\. サーバを立ち上げます :

```bash
npm start
```

&nbsp;&nbsp;&nbsp;&nbsp;5.1\. 運用環境で実行するために forever.js をインストール
することもできます :

```bash
sudo npm install forever -g
```

&nbsp;&nbsp;&nbsp;&nbsp;5.2\. そして、forever に使用してサーバを実行します :

```bash
forever start bin/www
```

&nbsp;&nbsp;&nbsp;&nbsp;5.3\. プロセスのステータスを知るためには、次のコマンドを
実行します :

```bash
forever status
```

## Docker インストール

### 要件

Keyrock を実行するには、事前に以下のソフトウェアをインストールしておく必要があり
ます :

-   [Docker](https://www.docker.com/).

-   [Docker Compose](https://docs.docker.com/compose).

### インストール

また、この GE の構築を容易にするための Docker イメージも提供しています。

-   [ここ](https://github.com/ging/fiware-idm/tree/master/extras/docker) に
    、Dockerfile とその使い方を説明しているドキュメントがあります

-   [Docker Hub](https://hub.docker.com/r/fiware/idm/) に、パブリック・イメージ
    があります
