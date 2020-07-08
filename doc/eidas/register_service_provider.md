# Registering an application as a eIDAS Service Provider

Once the IdM has be configured to support eID authentication, registered
applications can enable this kind of authentication individually.

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
`http://idm-host/idm/applications/*application-id*/saml2/metadata`. This
metadata file is needed for registering the Service Provider in the eIDAS node.

**Note:** It is very important to register the Service Provider in the eIDAS
node following the specific instructions of the node owner. This instructions
depends on the Member State where the node is deployed. Testing nodes can be
deployed following the
[instructions provided by the EC](https://ec.europa.eu/cefdigital/wiki/display/CEFDIGITAL/eIDAS-Node+Integration+Package).
