# API

Identity Manager (IdM) GE API 仕様は、認証およびユーザーに関する既存の標準に
準拠し、アクセス情報を提供します。

この仕様は、開発スキルを持つサービス開発者とクラウド・プロバイダを対象と
しています。前者については、このドキュメント はIdentity Management Service API
と相互運用する方法の完全な仕様を提供します。後者の場合、この仕様は、記述された
機能を提供するためにクライアント・アプリケーション開発者に提供される
インタフェースを示します。この情報を使用するには、まず、Generic Enabler
サービスについて一般的な知識を持っている必要があります。

API ユーザ は以下に精通している必要があります :

-   RESTful Web サービス
-   HTTP/1.1
-   JSON および/または　XML データ・シリアライゼーション・フォーマット

ユーザは API を通じて以下のアクションを実行できます :

-   認証 (Authentication)
-   アプリケーションを管理 (Authentication)
-   ユーザを管理 (Manage Users)
-   組織を管理 (Manage Organizations)
-   ロールを管理 (Manage Roles)
-   パーミッションを管理 (Manage Permissions)
-   IoT Agents を管理 (Manage Permissions)
-   Pep Proxies の管理 (Manage Pep Proxies)

API リクエストの作成方法の詳細は、
[Keyrock Apiary](https://keyrock.docs.apiary.io/)
にあります。API リクエストには、
[ここ](https://keyrock.docs.apiary.io/#reference/keyrock-api/authentication)
の説明に従って作成できる認証トークンを含める必要があります。
