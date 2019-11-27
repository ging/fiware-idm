# 一般的な環境変数

次の表は、Keyrock の設定を容易にするために使用できるすべての環境変数について説明
しています。

| 名前                                | タイプ  | 説明                                                                                                                            | 可能な値                    |
| ----------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| IDM_PORT                            | Integer | IdM Keyrock が実行されるポート                                                                                                  | 0 から 65536                |
| IDM_HOST                            | String  | Keyrock を実行しているホストの名前                                                                                              | -                           |
| IDM_DEBUG                           | Boolean | ログ表示を有効にする                                                                                                            | true,false                  |
| IDM_EMAIL_LIST                      | String  | ドメインをフィルタリングするために使用されるリストのタイプ                                                                      | null,whitelist,blacklist    |
| IDM_HTTPS_ENABLED                   | Boolean | HTTPS でリッスンするように Keyrock を有効にする                                                                                 | true,false                  |
| IDM_HTTPS_PORT                      | Integer | HTTPS が有効な場合に IdM Keyrock がリッスンするポート                                                                           | 0 to 65536                  |
| IDM_SESSION_SECRET                  | String  | エクスプレス・セッションでユーザ情報を暗号化するための値                                                                        | -                           |
| IDM_SESSION_DURATION                | Integer | ユーザ・セッションの寿命                                                                                                        | -                           |
| IDM_ENCRYPTION_KEY                  | String  | salt が使用されていない場合に DB 内のパスワードを暗号化するために使用される値                                                   | -                           |
| IDM_CORS_ENABLED                    | Boolean | Keyrock CORS を有効にする                                                                                                       | true,false                  |
| IDM_CORS_ORIGIN                     | String  | 許可されているドメインのリスト (カンマ区切り)                                                                                   | -                           |
| IDM_CORS_METHODS                    | String  | HTTPS 許可動詞のリスト (カンマ区切り)                                                                                           | -                           |
| IDM_CORS_ALLOWED_HEADERS            | String  | 許可されているヘッダのリスト (カンマ区切り)                                                                                     | -                           |
| IDM_CORS_EXPOSED_HEADERS            | String  | カンマで区切られた公開ヘッダのリスト (カンマ区切り)                                                                             | -                           |
| IDM_CORS_CREDENTIALS                | Boolean | ヘッダにクッキーを含める                                                                                                        | true,false                  |
| IDM_CORS_MAS_AGE                    | Integer | プリフライト・リクエストの結果の長さを示す                                                                                      | -                           |
| IDM_CORS_PREFLIGHT                  | Boolean | プリフライト・リクエストを許可する                                                                                              | true,false                  |
| IDM_CORS_OPTIONS_STATUS             | Integer | HTTP OPTIONS 動詞のステータス・レスポンス・コード                                                                               | -                           |
| IDM_OAUTH_EMPTY_STATE               | Boolean | Allow empty state in service requests                                                                                           | true, false                 |
| IDM_OAUTH_AUTH_LIFETIME             | Integer | OAuth2 認証コードの有効期間                                                                                                     | -                           |
| IDM_OAUTH_ACC_LIFETIME              | Integer | OAuth2 アクセス・トークンの有効期間                                                                                             | -                           |
| IDM_OAUTH_ASK_AUTH                  | Boolean | true に設定すると、OAuth2 を使用してサービスにログインしたときに認証メッセージをリスエストします i                              | true,false                  |
| IDM_OAUTH_REFR_LIFETIME             | Integer | OAuth2 リフレッシュ・トークンの有効期間                                                                                         | -                           |
| IDM_OAUTH_UNIQUE_URL                | Boolean | URL を一意のパラメータとして設定する (このパラメータは、redirect_sign_out_uri の場合、サインアウト後のリダイレクトに使用される) | true,false                  |
| IDM_API_LIFETIME                    | Integer | Keyrock でリソースを作成するために使用される API トークンの有効期間                                                             | -                           |
| IDM_PDP_LEVEL                       | String  | 基本 (HTTP 動詞+パス) または詳細 (XML ルール。Authforce インスタンスが必要) の承認ルールを許可する                              | basic,advanced              |
| IDM_AUTHZFORCE_ENABLED              | Boolean | AuthZforce を使用して基本および高度なルールを保存する                                                                           | true,false                  |
| IDM_AUTHZFORCE_HOST                 | String  | AuthZforce が実行されているホストの名前                                                                                         | -                           |
| IDM_AUTHZFORCE_PORT                 | Integer | AuthZforce が実行されているポート                                                                                               | 0 to 65536                  |
| IDM_DB_HOST                         | String  | データベースを実行しているホストの名前                                                                                          | -                           |
| IDM_DB_PASS                         | String  | データベースに対してアクションを実行するために Keyrock を認証するためのパスワード                                               | -                           |
| IDM_DB_USER                         | String  | データベースに対してアクションを実行するために Keyrock を認証するためのユーザ名                                                 | -                           |
| IDM_DB_NAME                         | String  | Keyrock によって使用されるデータベースの名前                                                                                    | -                           |
| IDM_DB_DIALECT                      | String  | データベースの SQL ダイアレクト                                                                                                 | mysql,sqlite,postgres,mssql |
| IDM_DB_PORT                         | Integer | データベースが稼働しているポート                                                                                                | 0 to 65536                  |
| IDM_EX_AUTH_ENABLED                 | Boolean | 外部ユーザ・テーブルを使用してユーザを認証する                                                                                  | true,false                  |
| IDM_EX_AUTH_ID_PREFIX               | String  | 外部ユーザがログインしたときに Keyrock ユーザ・テーブルの ID に追加されるプレフィックス                                         | -                           |
| IDM_EX_AUTH_PASSWORD_ENCRYPTION     | String  | 外部ユーザ・テーブルのパスワードを暗号化するために使用されるアルゴリズム                                                        | -                           |
| IDM_EX_AUTH_PASSWORD_ENCRYPTION_KEY | String  | 外部 DB のパスワードを確認するための値                                                                                          | -                           |
| IDM_EX_AUTH_DB_HOST                 | String  | 外部データベースを実行しているホストの名前                                                                                      | -                           |
| IDM_EX_AUTH_PORT                    | Integer | 外部データベースを実行しているポート                                                                                            | 0 to 65536                  |
| IDM_EX_AUTH_DB_NAME                 | String  | 外部データベースの名前                                                                                                          | -                           |
| IDM_EX_AUTH_DB_USER                 | String  | 外部データベースに対してアクションを実行するために Keyrock を認証するためのユーザ名                                             | -                           |
| IDM_EX_AUTH_DB_PASS                 | String  | Keyrock を認証して外部データベースに対してアクションを実行するためのパスワード                                                  | -                           |
| IDM_EX_AUTH_DB_USER_TABLE           | String  | Keyrock が外部認証を実行するテーブルの名前                                                                                      | -                           |
| IDM_EX_AUTH_DIALECT                 | String  | 外部データベースの SQL 言語                                                                                                     | mysql,sqlite,postgres,mssql |
| IDM_EMAIL_HOST                      | String  | メール・サーバを実行しているホストの名前                                                                                        | -                           |
| IDM_EMAIL_PORT                      | Integer | メール・サーバを実行しているポート                                                                                              | 0 to 65536                  |
| IDM_EMAIL_ADDRESS                   | String  | ユーザに E メールを送信するために Keyrock が使用する E メールアドレス                                                           | -                           |
| IDM_TITLE                           | String  | 新しいテーマを使用するときの Keyrock の名前                                                                                     | -                           |
| IDM_THEME                           | String  | すべての新しいスタイルが格納されているフォルダの名前                                                                            | -                           |
| IDM_EIDAS_ENABLED                   | Boolean | 自分の eID を使用してサービスでユーザ認証を許可するには、Keyrock を有効にします                                                 | true,false                  |
| IDM_EIDAS_GATEWAY_HOST              | String  | Keyrock が稼働しているホストの名前                                                                                              | -                           |
| IDM_EIDAS_NODE_HOST                 | String  | ノード eIDAS サービスを実行しているホストの名前                                                                                 | -                           |
| IDM_EIDAS_METADATA_LIFETIME         | Integer | eIDAS 認証を有効にしたサービスのメタデータの有効期間                                                                            | -                           |
| IDM_ADMIN_ID                        | String  | Keyrock 内の管理デフォルト・ユーザの ID                                                                                         | -                           |
| IDM_ADMIN_USER                      | String  | Keyrock のデフォルト管理者ユーザのユーザ名                                                                                      | -                           |
| IDM_ADMIN_EMAIL                     | String  | Keyrock のデフォルト管理者ユーザの E メール                                                                                     | -                           |
| IDM_ADMIN_PASS                      | String  | Keyrock のデフォルト管理者ユーザのパスワード                                                                                    | -                           |
| IDM_USAGE_CONTROL_ENABLED           | String  | 使用制御機能を有効にする                                                                                                        | -                           |
| IDM_PTP_HOST                        | String  | PTP を実行しているホストの名前                                                                                                  | -                           |
| IDM_PTP_PORT                        | Integer | PTP をリッスンしているポート                                                                                                    | 0 to 65536                  |
