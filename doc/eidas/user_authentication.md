# User Authentication

When a user is going to authenticate in an application with eIDAS connection
enabled, a new button that allows authentication with eID is included in the Log
in panel:

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/eidas_login.png)

<p align="center">Figure 5: eIDAS application login panel</p>

When clicking in the option _Sign with eID_ the user will be redirected to the
eIDAS authentication gateway to login using his/her national identifier. For
instance, the spanish gateway has the following interface:

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/eidas_spain1.png)

<p align="center">Figure 6: Spanish eIDAS gateway</p>

If the user selects the option for authenticating european citizens, they is
redirected to a new view in which, selecting the specific country, she/he can
authenticate using her/his national identifier:

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/eidas_spain2.png)

<p align="center">Figure 7: Spanish eIDAS gateway</p>

Once the authentication is performed, the eIDAS node sends de SAML response back
to the IdM. Then, IdM extracts the user information from the response and
proceeds with the creation of a local user.

Once the local user is created, Keyrock generates an OAuth 2.0 access token as
for a regular user. This token can be used for every
authentication/authorization process in registered applications. Thus, from that
moment the local user is an eIDAS user and, therefore, has the same rights and
features than every user registered in Keyrock. The user data is included in the
token validation information when it is checked, for instance, from a PEP Proxy.

The next time the user wants to authenticate using eIDAS the process is the same
one. However, after the eIDAS authentication, IdM detects the user has been
already created in its database and it does simply create the token without
performing the user creation.
