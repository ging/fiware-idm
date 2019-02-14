# Connecting IdM to a eIDAS node

## Introduction

Secure electronic identification (eID) is one of the key enablers of data
protection, privacy and the prevention of online fraud, especially in new areas
of application, like Smart Cities, where incorporating real identities into
trustable infrastructures has a huge potential.

eID can guarantee the unambiguous identification of a person and make it
possible to get the service delivered to the person who is really entitled to
it. The Electronic Identification, Authentication and Trust Services (eIDAS)
Regulation provides a solution to European Member States for recognizing and
accepting eIDs issued in other Member States.

Technical specifications and reference implementations of the interoperability
nodes for the eID mechanisms were
[published as open source](https://joinup.ec.europa.eu/document/eidas-technical-specifications-v10)
on 26th November 2015 for the technological infrastructure under Connecting
Europe Facility (CEF) program.

The ultimate goal is to offer the possibility to EU citizens to use their
national eID in other EU countries when accessing public and private services
online.

The FIWARE identity - eIDAS authentication module that this GE offers allows CEF
eID transnational authentication of EU citizens by means of their national eID
in FIWARE based OAuth2 authentication domains.

Thus, every service deployed according FIWARE security basis, is now accessible
by european citizens using their eID and in a transparent way for service
providers.

## Architecture

The FIWARE identity - eIDAS authentication module allows a user with a valid
eIDAS account (provided by its national eID) to directly login in the IdM and
obtain an OAuth 2.0 access token that represent him/her in terms of
authorization.

For enabling this, the service has to be registered in both IdM and eIDAS node.
The service is registered in the IdM as a regular **Application**, including
some extra configuration parameters as explained [below](#def-registering-app).
On the other hand the service has to be registered in the eIDAS node as a
**Service Provider** following the procedure of the specific Member State. Then,
when the user is going to authenticate in the IdM it will have the option of
selecting a kind of “Login with eID” option that will redirect it to the
specific authentication gateway.

Then, the IdM and the eIDAS node will interchange the needed SAML requests to
finally obtain the user eIDAS profile. With this profile, the IdM will create a
local user mapping the received attributes with the local ones and creating an
authorization code. This code will be sent to the Service and the Service will
finally request the Access Token.

Once the service has the Access Token, it can use it as always to authorize
requests to other GEs. Furthermore, as the user is created in the IdM,
permissions and roles could be managed in the same way than for a regular local
user. Next figures show the architecture and the dataflow interchanged between
the entities.

<p align="center"><img src="https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/eidas_arch.png" width="740" align="center"></p>
<p align="center">Figure 1: eIDAS integration in FIWARE IAM model</p>

<p align="center"><img src="https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/eidas_flow.png" width="740" align="center"></p>
<p align="center">Figure 2: FIWARE identity - eIDAS data flow</p>

## Server configuration

For configuring IdM to allow users to login with their eID, the connection to a
eIDAS node has to be enabled in the configuration file:

```
config.eidas = {
	enabled: true,
	gateway_host: 'localhost',
	node_host: 'https://eidas.node.es/EidasNode',
	metadata_expiration: 60 * 60 * 24 * 365 // One year
}
```

-   enabled: set to _true_ enables the connection to the eIDAS node.
-   gateway_host: indicates the DNS of the IdM service.
-   node_host: indicates the endpoint where the eIDAS node server is running.
-   metadata_expiration: expiration time for the service certificates.

## Registering an application as a eIDAS Service Provider

Once the IdM has be configured to support eID authentication, registered
applications can enable this kind of authentication indidually.

During the registration process a new checkbox is included as seen in the
following image:

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/eidas_registration.png)

<p align="center">Figure 3: Enabling eIDAS in application registration</p>

Then, a new step in the registration process is included. In this new step the
data regarding the **Service Provider** registered in the eIDAS node has to be
filled.

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/eidas_data.png)

<p align="center">Figure 4: eIDAS Service Provider data</p>

Once the application is registered, the metadata of the Service Provider is
exposed in the endpoint
http://idm-host/idm/applications/*application-id*/saml2/metadata. This metadata
file is needed for registering the Service Provider in the eIDAS node.

**Note:** It is very important to register the Service Provider in the eIDAS
node following the specific instructions of the node owner. This instructions
depends on the Member State where the node is deployed. Testing nodes can be
deployed following the
[instructions provided by the EC](https://ec.europa.eu/cefdigital/wiki/display/CEFDIGITAL/eIDAS-Node+-+Current+release).

## User authentication

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
