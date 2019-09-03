# Architecture

The FIWARE identity - eIDAS authentication module allows a user with a valid
eIDAS account (provided by its national eID) to directly login in the IdM and
obtain an OAuth 2.0 access token that represent him/her in terms of
authorization.

For enabling this, the service has to be registered in both IdM and eIDAS node.
The service is registered in the IdM as a regular **Application**, including
some extra configuration parameters as explained
[here](../eidas/register_service_provider.md). On the other hand the service has
to be registered in the eIDAS node as a **Service Provider** following the
procedure of the specific Member State. Then, when the user is going to
authenticate in the IdM it will have the option of selecting a kind of “Login
with eID” option that will redirect it to the specific authentication gateway.

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
