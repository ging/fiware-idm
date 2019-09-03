# API

Identity Manager (IdM) GE API specifications comply with existing standards for
authentication and user and provide access information.

This specification is intended for Service Consumers (with development skills)
and Cloud Providers. For the former, this document provides a full specification
of how to interoperate with the Identity Management Service API. For the latter,
this specification indicates the interface to be provided to the client
application developers to provide the described functionalities. To use this
information, the reader should first have a general understanding of the Generic
Enabler service.

The API user should be familiar with:

-   RESTful web services
-   HTTP/1.1
-   JSON and/or XML data serialization formats.

Users can perform these action through the API:

-   Authentication
-   Manage Applications
-   Manage Users
-   Manage Organizations
-   Manage Roles
-   Manage Permissions
-   Manage IoT Agents
-   Manage Pep Proxies

You can find a full description of how to make API requests in the
[Keyrock Apiary](https://keyrock.docs.apiary.io/). The API requests should
include an authentication token that can be created as is described
[here.](https://keyrock.docs.apiary.io/#reference/keyrock-api/authentication)
