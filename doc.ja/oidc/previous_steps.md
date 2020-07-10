# ユーザ・アカウントを登録

FIWARE IdM の使用を開始するには、まず自分のアカウントを登録する必要があります。
その方法は、
[ユーザ＆プログラマ・マニュアル](../user_and_programmers_guide/user_guide.md#sign-in)
で確認できます。

# アプリケーションを登録

次のステップは、独自のアプリケーションを登録することです。`Callback URL` 属性は、
OAuth2 および OIDC 認証で使用される必須パラメータです。IdM は OAuth2 で使用される
`Client ID` と `Client Secret` を提供します。その方法は、
[ユーザ＆プログラマ・マニュアル](../user_and_programmers_guide/application_guide.md#register-an-application)
で確認できます。

# OpenID Connect を有効化

登録プロセス中に、次の図に示すように、新しいチェックボックスが含まれます:

<img src="https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/oidc_register.png" style="border-style: none;"/>
<p align="center">図 1: アプリケーションの登録時に OIDC を有効化</p>

アプリケーションがすでに登録されている場合は、アプリケーションの編集インターフェイスから
OIDC を有効にできます:

<img src="https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/oidc_edit.png" style="border-style: none;"/>
<p align="center">図 2: アプリケーションの編集時に OIDC を有効化</p>

OIDC が有効になると、Json Web Tokens に署名するための新しいシークレットが生成されます。
生成された Json Web Tokens の署名を検証するために、このシークレットを構成して
アプリケーションで使用する必要があります。

<img src="https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/oidc_jwtsecret.png" style="border-style: none;"/>
<p align="center">図 3: OIDC secret</p>

このシークレットは OAuth2 セクションで更新できます。

<img src="https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/oidc_reset.png" style="border-style: none;"/>
<p align="center">図 4: OIDC secret をリセット</p>
