# Register your user account

In order to start using the FIWARE IdM, you must first register your own
account. You can see how to do that at
[User & Programmers Manual](../user_and_programmers_guide/user_guide.md#sign-in).

# Register your application

The next step is registering your own application. The `Callback URL` attribute
is a mandatory parameter used in OAuth2 and OIDC authentication. The IdM
provides you with a `Client ID` and a `Client Secret` which are used in OAuth2.
You can see how to do that at
[User & Programmers Manual](../user_and_programmers_guide/application_guide.md#register-an-application).

# Enabling OpenID Connect

During the registration process a new checkbox is included as seen in the
following image:

<img src="https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/oidc_register.png" style="border-style: none;"/>
<p align="center">Figure 1: Enabling OIDC when registering an application</p>

If the application is already registered, you can enable OIDC through the edit
application interface:

<img src="https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/oidc_edit.png" style="border-style: none;"/>
<p align="center">Figure 2: Enabling OIDC when editing an application</p>

Once OIDC is enabled, a new secret is generated to sign Json Web Tokens. This
secret must be configured and used in the application in order to validate the
signature of the Json Web Tokens generated.

<img src="https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/oidc_jwtsecret.png" style="border-style: none;"/>
<p align="center">Figure 3: OIDC secret</p>

This secret can be refreshed through the OAuth2 section.

<img src="https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/oidc_reset.png" style="border-style: none;"/>
<p align="center">Figure 4: Reseting OIDC secret</p>
