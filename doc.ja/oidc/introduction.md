# イントロダクション

FIWARE IdM は、
[OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
で説明されている OpenID Connect (OIDC) 標準に準拠しており、そこで定義されている
3つの認証フローすべてをサポートしています。OIDC プロトコルは OAuth 2.0
の上に構築され、その標準で定義されているグラント・タイプを再利用します。

このセクションでは、OIDC プロトコルと異なるフローを使用して id_tokens
を生成する方法について説明します。id_token は、Keyrock のユーザに関する情報を含む
Json Web Token (JWT) です。
