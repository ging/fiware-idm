## アプリケーションの一覧

左側のメニューにある、"My Applications" オプションをクリックします。ここでは、
あなたが認可されているアプリケーションを見ることができます。ユーザが所属する
組織の1つを選択し、そのすべてのアプリケーションを表示することもできます。 

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_index_apps1.png)

<p align="center">図4: ユーザ・アプリケーションの一覧表示</p>

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_index_apps2.png)

<p align="center">図5: 組織のアプリケーションのリスト</p>

## アプリケーションの登録

ホーム・ページの "Applications" セクションで、"Register" をクリックして
新しいアプリケーションを登録できます。"My Application " ページから
アプリケーションを登録することもできます。 

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_homepage2.png)

<p align="center">図6: アプリケーション登録の ホーム</p>

必須の属性がいくつかあります :

-   名前 (Name)

-   説明 (Description)

-   URL

-   Callback URL. OAuth 2.0プロトコルで必須

-   プロバイダ(Provider). 誰がアプリケーションのプロバイダになるのかを選択する必要が
    あります。自分自身か、あなたが所有者である組織の1つです


残りの属性は必須ではありませんが、その機能を理解することが重要です :

-   Sign-out Callback URL. サービスからサインアウトが実行された場合に Keyrock
    がユーザをリダイレクトする先の URL です。設定されていない場合は、URL
    パラメータで指定されたドメインにリダイレクトされます。
    [サインアウト oauth セクション](../oauth/sign_out_oauth_service.md#sign-out)
    で詳細を参照してください。

-   グラント・タイプ (Grant Type). OAuth アクセス・トークンを取得するさまざまな方法を
    選択できます。
    [OAuth2.0 による IdM への接続](../oauth/oauth_documentation.md#introduction)
    を確認してください

-   eIDAS 認証 (eIDAS Authentication). この属性はあなたのサービスが eID
    によってユーザを認証することを可能にします。
    [IdM を eIDAS ノードに接続するセクション](../eidas/introduction.md)
    で詳細を参照してください

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_register_app.png)

<p align="center">図7: KeyRock による Application の登録</p>

"Next" をクリックします。

2番目のステップでは、有効なファイル・タイプを選択してアプリケーションのロゴを
読み込みます。選択した画像の枠を再設定するオプションがあります。

このプロセスを完了したら "Crop Image" をクリックし、"Next" をクリックします。

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_upload_logo.png)

<p align="center">図8: アプリケーションのロゴのアップロード</p>

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_reframe_logo.png)

<p align="center">図9: 画像のトリミング</p>

3番目のステップでは、アプリケーションのロールとパーミッションを設定します。
次のセクションで説明します。

## ロールの管理

このページには、プロバイダ(Provider) と購入者(Purchaser) の2つの
デフォルト・ロールがあります。このロールの1つをクリックすると、
そのロールに割り当てられたパーミッションが表示されます。

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_application_roles.png)

<p align="center">図10: ロールとパーミッションの一覧</p>

また、新しいロールとパーミッションを作成することもできます。

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_application_roles_permissions.png)

<p align="center">図11: ロールとパーミッションの作成</p>

新しいロールを作成するには、"New role" をクリックし、ロールの名前を
書き込んでから、"Save"をクリックします。 

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_application_roles_create.png)

<p align="center">図12: Create a role</p>

"New Permission" をクリックして新しいパーミッションを追加することもできます。
ここでは、パーミッション、説明、HTTP verb (GET, PUT, POST, DELETE) の名前と
そのパーミッションへのパス (正規表現も使用できます) を入力する必要があります。
"Create Permission" と "Finish" をクリックして、アプリケーションの作成を
完了します。 

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_application_permissions_create.png)

<p align="center">図13: パーミッションの作成</p>

必要に応じて、特定の XACML ルールを設定することもできます。

さらに、対応するボタンをクリックして作成したすべてのロールとパーミッションを
編集および削除できます。

対応するチェック・ボックスをオンにすると、新しいロールのパーミッションを
設定できます。新しい割り当てを作成するには、"Save" ボタンをクリックします。 

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_application_role_permission_assignment.png)

<p align="center">図14: KeyRock の新しい割り当て</p>

## アプリケーションの表示

アプリケーションを作成すると、すべての情報が表示されるページにリダイレクト
されます。この情報には、"My Applications" ページから対応するアプリケーションを
クリックしてアクセスすることもできます。このページには、アプリケーションの
Oauth2 資格情報が表示されます。

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_application_show.png)

<p align="center">図15: アプリケーションのビュー</p>

いくつかのアクションを実行することもできます :

 - アプリケーションを編集 : ここでは、アプリケーションの属性
   (名前, 説明, urn, redirect_uri, ロゴ)  を変更できます

 - ロールを管理 : 前のセクションで説明しました

 - PEP Proxy を登録

 - IoT Agent を登録

 - ユーザを認可

 - 組織を認可

## PEP Proxy と IoT Agent の登録

各アプリケーションに対して、Oauth2 を介した認証と認可を有効にするために
PEP Proxy を登録することができます。また、IoT Agent をアプリケーションに
登録して、IoT デバイスに軽量セキュリティメカニズムを提供することもできます。 

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_register_pep_iot.png)

<p align="center">図16: PEP Proxy と IoT Agent の登録</p>

このコンポーネントのパスワードをリセットしたり、削除したりすることもできます。

## ユーザと組織の認可

"Authorize" ボタンをクリックすると、アプリケーション内のユーザまたは組織を
追加できます。

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_authorize.png)

<p align="center">図17: KeyRock による認可</p>

ユーザとグループを管理できるモーダルを示します。ユーザまたは組織、および最初に
割り当てられたロールが表示されます。右の列にあるユーザまたは組織を検索できます。
図18と図19に示すように、ユーザのアイコンの下のロールのドロップダウンメニューを
クリックすることで、ユーザまたは組織が追加された後にロールを割り当てることが
できます。

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_authorize_users.png)

<p align="center">図18: KeyRock によるユーザの認可</p>

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_authorize_organizations.png)

<p align="center">図19: KeyRockによる組織の認可</p>

ロールを組織に割り当てる場合、ロールをアプリケーションの所有者またはメンバー
であるユーザに割り当てます。次のセクションでは、組織の管理方法について
詳しく説明します。

## 信頼できるアプリケーション (trusted applications) の認可

[ここ](../oauth/oauth_documentation.md#validate-authorization)
で説明したように
[Keyrock に組み込まれている PDP](../installation_and_administration_guide/configuration.md#authorization)
でパーミッションを検証するときには、パーミッションが作成されてユーザに
割り当てられたアプリケーションがチェックされます。

Keyrock を使用すると、アプリケーションの所有者は他のアプリケーションを
信頼できます。したがって、PDP チェックは、現在のアプリケーションまたは
それが信頼しているアプリケーションのいずれかにユーザが特定の権限を
持っているかどうかを検証します。信頼できるアプリケーションを追加するには、
API または Web インターフェースを使用できます :

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_trusted_applications.png)

<p align="center">図20: KeyRock による信頼できるアプリケーション</p>
