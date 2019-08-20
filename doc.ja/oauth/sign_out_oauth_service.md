# サイン・アウト

前のセクションでは、OAuth プロトコルを使用して、サービスが Keyrock でサイン・インを委任できる方法について説明しました。このセクションでは、完全なサイン・アウトを実行するためにサービスを設定する方法について説明します。これは、サービス内のユーザ・セッションだけでなく Keyrock 内のユーザ・セッションも削除することを意味します。

ユーザがサービスを介してサイン・インするときには、2つの方法があります :

-   ユーザがまだ Keyrock にサイン・インしていないとき

-   ユーザが以前に Keyrock ポータルにサイン・インしたことがある場合

サイン・アウトを成功させるには、[アプリケーションを登録するとき](../user_and_programmers_guide/application_guide.md#register-an-application)の Sign-out Callback Url パラメータを追加することをお勧めします。
アプリケーションがすでに作成されている場合は編集できます。それ以外の場合、サイン・アウトのリクエストはサービスが Keyrock に登録した URL　にリダイレクトされます。
[oauth の設定](../installation_and_administration_guide/configuration.md#oauth20)
を確認してください。

サイン・アウトのプロセスはユーザにとって完全に透過的です。

## ユーザはまだ Keyrock にサイン・インしていない場合

ユーザが　keyrock またはサービスで認可されていない場合にサイン・アウトするプロセスは以下のとおりです :

&nbsp;&nbsp;1\. ユーザは Keyrock を介してサービスにサイン・インします。ユーザが
有効なクレデンシャルを入力すると、oauth_sign_in パラメータを含むユーザ・セッションが
作成されます。このパラメーターは、ユーザが Keyrock ポータルに直接サイン・インする
のではなく、Keyrock に登録されたサービスを介してサイン・インしたことを意味します

&nbsp;&nbsp;2\. Keyrock がユーザ・セッションを作成したら、アクセス・トークンを
生成するためにOAuth フローを続けます

&nbsp;&nbsp;3\. 後で、ユーザがサイン・アウトしたいときには、サービスに
/auth/external_logout への DELETE リクエストを出すボタンを含める必要があります。
Keyrock がデータベースで登録されていないサービスを見つけるのを容易にするために、
他に OAuth クライアント ID をクエリ文字列に含めることをお勧めします

&nbsp;&nbsp;4\. Keyrock OAuth クライアント ID とサービス・ドメイン名を使用して
サービスを検索します。Keyrock が有効なサービスを見つけた場合、それを削除するために
oauth_sign_in がユーザ・セッションに保存されていることを確認します

&nbsp;&nbsp;5\. 最後に、Keyrock は Sign-out Callback URL または URL に格納されている
アドレスにユーザをリダイレクトします。サービスは自分のユーザ・セッションを
削除する必要があります

<img src="https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/oauth_sign_out_service_delete_session.png" style="border-style: none;"/>
<p align="center">図1: サービスによる認可</p>

## 以前に Keyrock ポータルでサイン・インしたユーザの場合

このプロセスは前のプロセスと似ていますが、この場合、ユーザはサービスよりも以前に 
Keyrock にサインインしています。 ユーザ・セッションが Keyrock で作成されるとき、
oauth_sign_in はそれに保存されません。そのため、ユーザが単一のサービスから
サイン・アウトすると、そのユーザ・セッションは Keyrock で削除されません。
ユーザがサービスを介して再度サインインしようとした場合、ユーザ・セッションは
まだ残っているため、Keyrock はユーザにクレデンシャルの紹介を求めません。

<img src="https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/oauth_sign_out_no_delete_session.png" style="border-style: none;"/>
<p align="center">図2: Keyrock による認可</p>
