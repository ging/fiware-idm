# 健全性チェック手順

健全性チェック手順は、システム管理者がインストールのテスト準備が整ったことを
確認するためのステップです。したがって、単体テスト、統合テスト、ユーザー検証に
進む前に、明白なまたは基本的な誤動作が修正されていることを確認するための
予備テストセットです。


## エンド・ツー・エンドのテスト

ユーザ・インターフェースが機能しているか確認してください :

1.  IdM のホストアドレスに到達できることを確認します。デフォルトで、Web
    アクセスにはログインページが表示されます

2.  有効なユーザー名とパスワードを取得し、これらの資格情報でアクセスします。
    資格情報の確認後のWeb ページは、IdM KeyRock Portal のランディングページです

3.  アプリケーション、組織などのリストを表示できることを確認します

API が機能しているか確認してください :

1.  [apiary](https://keyrock.docs.apiary.io/#reference/keyrock-api/authentication/create-token-with-password-method)
    に記述されているように API トークンをリクエストします

2.  アプリケーション、組織などのリストを取得できることを確認します。たとえば、
    次の方法でパスを確認できます :

```bash
curl --include \
     --header "X-Auth-token: <api_token>" \
  'http://idm-portal:3000/v1'
```

## 単体テスト

また、単体テストを実行して Keyrock が正しく機能しているかどうかを確認することも 
できます。 これを行うには、次の手順に従います :

&nbsp;&nbsp;1\. ディレクトリ test の下には、テストを実行するためのデフォルトの
設定がある config_test.js.template ファイルがあります。この設定ファイルは、
すべてのテストを実行した後に削除されるテスト・データベース (idm_test と呼ばれる)
を作成するために使用されます。まず、ルート・ディレクトリに config.js ファイルが
すでにあり、この設定を保存する場合は、このファイルを別のディレクトリに保存します。
次のシェルコマンドで上書きするか、config.js ファイルを config_testjs.template
の値で変更するだけです


```bash
cp test/config_test.js.template config.js
```

&nbsp;&nbsp;2\. 設定ファイルをコピーしたら、次のようにしてすべてのテストを実行
できます:

```bash
npm run test
```

&nbsp;&nbsp;&nbsp;&nbsp;2.1\. 必要に応じて個別のテストを実行することもできます :

```bash
npm run test:single test/unit/<path_to_file_test>.js
```

## 実行中プロセスのリスト

forever に使用した場合は、プロセスの状態を知るために次のコマンドを実行できます : 

```bash
 forever status
```

## ネットワーク・インターフェースのアップ＆オープン

HTTPS が有効になっているサーバを実行する場合は、IdM ポータルを読み込むために
TCP ポート 443 にWebブラウザからアクセスできる必要があります。

## データベース

GE のインストール時にデータベースを正しく取り込んだ場合は、そのデータベースとの
接続が確立しています。

必要なデータベースとテーブルは次のとおりです :

**TABLES**

| table_names                 | table_rows |
| --------------------------- | ---------- |
| SequelizeMeta               | 30         |
| auth_token                  | 4          |
| authzforce                  | 0          |
| eidas_credentials           | 0          |
| IoT                         | 2          |
| oauth_access_token          | 9          |
| oauth_authorization_code    | 0          |
| oauth_client                | 3          |
| oauth_refresh_token         | 8          |
| oauth_scope                 | 0          |
| organization                | 0          |
| pep_proxy                   | 1          |
| permission                  | 6          |
| role                        | 2          |
| role_assignment             | 6          |
| role_permission             | 7          |
| trusted_application         | 0          |
| user                        | 3          |
| user_authorized_application | 1          |
| user_organization           | 0          |
| user_registration_profile   | 0          |

# 診断手順

診断手順は、GE のエラーの原因を特定するためにシステム管理者が行う最初の手順
です。これらのテストでエラーの性質が特定されると、システム管理者はエラーの
正確なポイントと可能な解決方法を特定するために、より具体的で具体的なテストに
頼らざるを得なくなります。このような特定のテストは、このセクションの範囲外
です。

## リソースの可用性

UNIX コマンド `df` を使用して、2.5MB のディスク領域が残っていることを
確認します。

## リモートサービス・アクセス

ポート 443 にアクセスできることを確認してください。

## リソース消費

一般的なメモリ消費量は 100MBで、2GHz の CPU コアのほぼ 1％を消費しますが、
それはユーザのリクエストに依存します。

## I/O フロー

クライアントは、クライアントの Web ブラウザを介して KeyRock
インターフェイスにアクセスします。これは単純な HTTP トラフィックです。
ローカル・データベースにリクエストを出します。
