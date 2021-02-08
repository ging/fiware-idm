## サインイン

以前にアカウントを作成したことがある場合は "サインイン" に進み、それ以外の場合は
新しいアカウントを作成するには "サインアップ" に進みます :

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_login.png)

<p align="center">図1: IdM サインイン・ページ</p>

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_signup.png)

<p align="center">図2: IdM サインアップ・ページ</p>

正常にログインしたら、ホーム・ページにリダイレクトされます。アプリケーションと組
織という 2 つの主要なセクションがあります。

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_homepage1.png)

<p align="center">図3: IdM ホーム・ページ</p>

## ビジブル属性 (Visible attributes)

左側の垂直メニューを見て、"Edit your account" オプションをクリックします。

このページには、プロファイルに表示する属性を選択できるドロップ・ダウン・ メニュ
ーがあります。

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_visible_attributes.png)

<p align="center">図 4: ビジブル属性の選択</p>

## 共有属性 (Shared attributes)

OAuth を介してアプリケーションを認可する場合、アプリケーションと共有する属性を選
択できます。

資格情報を使用してサインインすると、ドロップ・ダウン・メニューのあるページが表示
されます。このメニューでは、アプリケーションがアクセスできるプロファイルから属性
を選択できます。

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_sharedattributes.png)

<p align="center">図 6: 共有属性の選択</p>

終了したら、"Authorize" ボタンをクリックして承認プロセスを終了します。

<!-- ## サードパーティ・アプリケーション・リスト

左側の垂直メニューにある、"Linked accounts" オプションをクリックします。

このページでは、あなたが認可されているアプリケーションのリストとそれらに関連する
重要な情報を見ることができます。

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_thirdpartyapplications.png)

<p align="center">図 8: サードパーティ・アプリケーション・リスト</p>

アプリケーションを削除することもできます。矢印をクリックすると、
"Revoke access" ボタンが表示されます。それはあなたができるモーダルを示して
います。

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_deletethirdpartyapplications.png)

<p align="center">図9: サードパーティ・アプリケーション・リストの削除</p> -->

## 二要素認証 (Two Factor Authentication)

二要素認証 (Two Factor Authentication) は、二段階認証 (two-step verification) と
も呼ばれ、ユーザを認証するための追加のセキュリティ・レイヤーです。どのセキュリテ
ィ・システムでも、使用できる認証要素は 3 つあります。ユーザが知っているもの、所
有しているもの、自分が所有しているものです。二要素認証では、最初の 2 つを使用し
ます。ユーザ名とパスワードの組み合わせ (knwoledge) と物理トークン (所有) です。

KeyRock の二要素認証の実装では、物理トークンはアプリのおかげでユーザのスマートフ
ォンになります。このアプリは、正しく設定された後、適切なユーザ名とパスワードと組
み合わせてユーザを認証する一意の時間ベースのパスワード (確認コードとも呼ばれます
) を生成します。アプリは、セットアップ後に確認コードを生成するためにインターネッ
ト接続を必要としません。

### 要件

[RFC 4226](https://tools.ietf.org/html/rfc4226) (HOTP: HMAC ベースのワンタイム
・パスワード・アルゴリズム) および
[RFC 6238](https://tools.ietf.org/html/rfc6238) (TOTP: 時間ベースのワンタイム・
パスワード・アルゴリズム) で定義されている OpenMFA 標準を実装するサードパーティ
・アプリをインストールする必要があります。

!!! 重要
[Google Authenticator](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=es)
をお勧めし ます。

### 二要素認証を有効化

これを有効にするには、KeyRock にログインして、設定メニューに移動する必要がありま
す。2 つの要素のセクションがあり、従うべきすべての指示があります。要約すると、次
のことを行う必要があります:

-   質問とその回答を提供します (秘密にしてください!)
-   提供された QR コードをアプリケーションでスキャンするか、シークレットを手動で
    挿入します
-   アプリケーションによって生成されたコードを Keyrock に挿入します

### サインイン

二要素認証が有効になると、サインイン・プロセスに新しいステップが追加されます。ユ
ーザ名とパスワードを入力すると、アプリによって生成された確認コードの入力を求めら
れます。

!!! 注便宜上、コンピュータを覚えておくことができ、そのコンピュータからサインイン
するときに確認コードは要求されません。このオプションは、信頼できるコンピュータで
のみ使用してください。

### 二要素認証を無効化

アカウントにサインインし、設定に移動して、それぞれのセクションで無効にします。無
効にすると、すべてのコンピュータで通常どおりログインできます。

### スマートフォンを紛失したり、アプリをアンインストールしたりするとどうなりますか

スマートフォンやアプリの紛失や盗難に備えたセキュリティ対策として、アクティベーシ
ョン・プロセスでセキュリティの質問と秘密の回答を提供するようお願いしています。こ
の質問と回答を使用して、認証を必要とせずに 2 要素認証を無効にすることができます
。
