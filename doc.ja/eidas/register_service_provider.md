# アプリケーションを eIDAS サービス・プロバイダとして登録

IdM が eID 認証をサポートするように設定されると、登録済みアプリケーションは
この種の認証を個別に有効にできます。

次の図に示すように、登録プロセス中に新しいチェック・ボックスが表示されます :

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/eidas_registration.png)

<p align="center">図3 : アプリケーション登録で eIDAS を有効化</p>

その後、登録プロセスの新しいステップが含まれます。この新しいステップでは、
eIDAS ノードに登録されている**サービス・プロバイダ**に関するデータを入力する
必要があります。

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/eidas_data.png)

<p align="center">図4 : eIDAS サービス・プロバイダのデータ</p>

アプリケーションが登録されると、サービス・プロバイダのメタデータはエンドポイント
`http://idm-host/idm/applications/*application-id*/saml2/metadata`
に公開されます。このメタデータ・ファイルは、サービス・プロバイダを eIDAS
ノードに登録するために必要です。

**注 :** ノード所有者の特定の指示に従ってサービス・プロバイダを eIDAS ノードに
登録することは非常に重要です。このインストラクションは、ノードがデプロイ
されているメンバの状態によって異なります。 テストノードは
[EC によって提供されるインストラクション](https://ec.europa.eu/cefdigital/wiki/display/CEFDIGITAL/eIDAS-Node+Integration+Package)
に従ってデプロイ開することができます。
