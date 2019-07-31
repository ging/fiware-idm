# Identity Manager - Keyrock

[![FIWARE Security](https://nexus.lab.fiware.org/repository/raw/public/badges/chapters/security.svg)](https://www.fiware.org/developers/catalogue/)
[![Support badge](https://img.shields.io/badge/tag-fiware-orange.svg?logo=stackoverflow)](https://stackoverflow.com/questions/tagged/fiware-keyrock)

Keyrock は、ID 管理を担当する FIWARE コンポーネントです。Keyrock を
[PEP Proxy](https://github.com/ging/fiware-pep-proxy) や
[Authzforce](https://github.com/authzforce/server)
などの他のセキュリティ・コンポーネントと組み合わせて使用すると、
OAuth 2 ベースの認証および認可のセキュリティをサービスやアプリケーションに
追加できます。

このプロジェクトは [FIWARE](https://www.fiware.org/) の一部です。詳しくは、
FIWARE Catalog の
[セキュリティ](https://github.com/Fiware/catalogue/tree/master/security)
の項目を確認してください。

## バックグラウンド

Keyrock 内の主な ID 管理の概念は次のとおりです :

-   ユーザ (Users) :

    -   Keyrock に登録アカウントを持っています

    -   組織を管理し、アプリケーションを登録できます

-   組織 (Organizations) :

    -   アプリケーションのリソースを共有するユーザのグループです
        (ロールと権限)

    -   ユーザはメンバまたは所有者になることができます
        (組織を管理します)

-   アプリケーション (Applications) :

    -   OAuth 2.0 アーキテクチャにおけるクライアントの役割を持ち、
        保護されたユーザ・データをリクエストします

    -   アプリケーションを明確に識別する Oauth 認証情報 (ID とシークレット)
        を使用してユーザを認証できます

    -   ユーザと組織の認可を管理するためのロールとパーミッションを定義します

    -   バックエンドを保護するために Pep Proxy を登録できます

    -   IoT Agents を登録できます

Keyrock は GUI と API インターフェースの両方を提供します。

## 使用法

Keyrock GUI の使用方法に関する情報は
[ユーザ＆プログラマ・マニュアル](user_and_programmers_guide/introduction.md)
にあります。

## API

リソースは、API を通じて管理することができます。例えば、ユーザ、
アプリケーションおよび組織です。詳細情報は
[API](api/introduction.md) のセクションにあります。

最後に、この Generic Enabler の主な用途の1つは、開発者が FIWARE ID
に基づいてアプリケーションに ID 管理 (認証と認可) を追加できるように
することです。これは、[OAuth2](https://oauth.net/2/) プロトコルにより
実現されています。詳細については、[OAuth2 API](oauth/introduction.md)
を確認してください。

## 7.x で導入された変更

7.x で導入された最大の変更点は、Identity Manager が Openstack
コンポーネントの Keystone と Horizon に依存しなくなったことです。
今は、完全に Node JS で実装されています。
その他の注目すべき変更は :

-   他のデータベースに対する認証をデフォルトのものとは異なるものにするために
    ドライバが実装されました

-   Web ポータルの外観は設定可能なテーマで簡単に変更できます

-   組織に属するアプリケーションを作成するためにユーザがセッションを
    切り替える必要がなくなりました

-   アプリケーションのパーミッションを編集または削除することができます。
    パーミッションは正規表現として定義できます

-   IdM は、サービスと eDIAS ノードとの間のゲートウェイとしての役割を果たし、
    ユーザが自分の国内 eID で認証できるようにすることができます

-   OAuth Refresh Token がサポートされています

-   OAuth Token タイプの設定 (永久トークン (Permanent tokens) と Json Web Tokens)

-   OAuth Revoke Token エンドポイントの有効化

-   国際化対応 UI (スペイン語、日本語、英語をサポート)

-   ユーザ管理パネル

-   OAuth Token 検証用の信頼できるアプリケーション (Trusted application)

-   IdM は基本認可の PDP としての役割を果たすことができます

-   完全なサインアウト。Keyrock だけでなくサービスでもセッションを削除します

-   欧州の eIDAS インフラストラクチャを通じた電子 ID (eID) を使用した認証

-   データ使用制御ポリシー (Data Usage Control Policies)
