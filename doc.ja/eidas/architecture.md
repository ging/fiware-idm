# アーキテクチャ

FIWARE identity - eIDAS authentication モジュールを使用すると、その国の
eIDによって提供される有効な eIDAS アカウントを使用して IdM に直接ログインし、
認可 (authorization) に関して自分を表す OAuth 2.0アクセストークンを
取得できます。

これを有効にするには、サービスを IdM と eIDAS ノードの両方に登録する必要が
あります。サービスは IdM に通常の **Application**として登録されています。
[ここ](../eidas/register_service_provider.md) で説明されているように
いくつかの追加の設定パラメータも含まれています。
一方、サービスは特定の加盟国の手続きに従って **Service Provider** として
eIDAS ノードに登録されなければなりません。その後、ユーザが IdM で認証しようと
しているときには、特定の認証ゲートウェイにリダイレクトする "Login with eID"
オプションの種類を選択するオプションがあります。

その後、IdM と eIDAS ノードは必要な SAML 要求を交換して、最終的にユーザの
eIDAS プロファイルを取得します。このプロファイルを使用して、IdM は受信した
属性をローカルの属性とマッピングして認証コードを作成するローカル・ユーザを
作成します。このコードはサービスに送信され、サービスは最終的に
アクセス・トークンを要求します。

サービスがアクセス・トークンを取得すると、他の GE へのリクエストを承認する
ために常に使用できます。さらに、IdM でユーザーが作成されると、通常の
ローカル・ユーザと同じ方法で権限とロールを管理できます。次の図は、
エンティティ間で交換されるアーキテクチャとデータ・フローを示しています。

<p align="center"><img src="https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/eidas_arch.png" width="740" align="center"></p>
<p align="center">図1: FIWARE IAM モデルへの eIDAS の統合</p>

<p align="center"><img src="https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/eidas_flow.png" width="740" align="center"></p>
<p align="center">図2: FIWARE identity - eIDAS データ・フロー</p>
