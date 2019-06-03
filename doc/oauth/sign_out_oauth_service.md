# Sign out

In previous sections we have described how a service could delegate sign in with
Keyrock thanks to OAuth protocol. This section describes how to configure a
servic in order to perform a complete sign out which means not only to delete
user session in the service but also in Keyrock.

There are two approaches when a user sign in through a service:

-   When a user is not signed in Keyrock yet.

-   When a user has previously signed in Keyrock portal.

To perform a successful sing out is recommended to add Sign-out Callback Url
parameter when
[registering an application](../user_and_programmers_guide/application_guide.md#register-an-application).
If the application is already created, it can be edited. Otherwise, the sign out
request will be redirected to the URL which the service has registered in
Keyrock.
[Check config oauth](../installation_and_administration_guide/configuration.md#oauth20).

Mention that the process of signing out is completely transparent for the user.

## User not signed in Keyrock yet

The process to sign out when the user is not authenticated in keyrocj or in the
service is described below:

&nbsp;&nbsp;1\. User sign in a service through Keyrock. If the user introduce a
valid credentials, a user session will be created including oauth_sign_in
parameter. This parameter means that the user has signed in through a service
registered in Keyrock instead of signing in Keyrock portal directly.

&nbsp;&nbsp;2\. Once, Keyrock creates the user session, continue woth the OAuth
flow to generate an access token.

&nbsp;&nbsp;3\. Later, when the user wants to sign out, the service should
include a button which will make a DELETE request to /auth/external_logout. It
is recommended to include in the request a query string the OAuth Client ID in
other to ease Keyrock to find de registered service in its database.

&nbsp;&nbsp;4\. Keyrock search service using the OAuth Client ID and the service
domain name. If Keyrock finds a valid service, checks that oauth_sign_in is
stored in the user session in order to delete it.

&nbsp;&nbsp;5\. Finally, Keyrock redirects the user to the address stored in
Sign-out Callback URL or in URL and the service should remove its own user
session.

<img src="https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/oauth_sign_out_service_delete_session.png" style="border-style: none;"/>
<p align="center">Figure 1: Authenticate through service</p>

## User previously signed in Keyrock portal

This process is similar to the previous one but in this case the user has signed
in Keyrock before than in the services. When the user session is created in
Keyrock the oauth_sign_in is not stored on it. So that when the user makes a
sign out from a single service, the user session won't be deleted in Keyrock. If
the user tries to sign in again through a service, Keyrock won't ask them to
introduce their credentials as the user session is still remained.

<img src="https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/oauth_sign_out_no_delete_session.png" style="border-style: none;"/>
<p align="center">Figure 2: Authenticate through Keyrock</p>
