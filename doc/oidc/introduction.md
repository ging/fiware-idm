# Introduction

The FIWARE IdM complies with the OpenID Connect (OIDC) standard described in
[OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
and supports all three authentication flows defined there. The OIDC protocol is
built on the top of OAuth 2.0 and reuses the grant types defined in that
standard.

This section will cover how to generate id_tokens using OIDC protocol and its
differents Flows. An id_token is a Json Web Token (JWT) which contains
information about a Keyrock's user.
