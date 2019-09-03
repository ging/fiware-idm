# Identity Manager - Keyrock

[![FIWARE Security](https://nexus.lab.fiware.org/repository/raw/public/badges/chapters/security.svg)](https://www.fiware.org/developers/catalogue/)
[![Support badge](https://img.shields.io/badge/tag-fiware-orange.svg?logo=stackoverflow)](https://stackoverflow.com/questions/tagged/fiware-keyrock)

Keyrock is the FIWARE component responsible for Identity Management. Using
Keyrock (in conjunction with other security components such as
[PEP Proxy](https://github.com/ging/fiware-pep-proxy) and
[Authzforce](https://github.com/authzforce/server)) enables you to add
OAuth2-based authentication and authorization security to your services and
applications.

This project is part of [FIWARE](https://www.fiware.org/). For more information
check the FIWARE Catalogue entry for
[Security](https://github.com/Fiware/catalogue/tree/master/security).

## Background

The main identity management concepts within Keyrock are:

-   Users:

    -   Have a registered account in Keyrock.

    -   Can manage organizations and register applications.

-   Organizations:

    -   Are group of users that share resources of an application (roles and
        permissions).

    -   Users can be members or owners (manage the organization).

-   Applications:

    -   has the client role in the OAuth 2.0 architecture and will request
        protected user data.

    -   Are able to authenticate users using their Oauth credentials (ID and
        secret) which unequivocally identify the application

    -   Define roles and permissions to manage authorization of users and
        organizations

    -   Can register Pep Proxy to protect backends.

    -   Can register IoT Agents.

Keyrock provides both a GUI and an API interface.

## Usage

Information about how to use the Keyrock GUI can be found in the
[User & Programmers Manual](user_and_programmers_guide/introduction.md).

## API

Resources can be managed through the API (e.g. Users, applications and
organizations). Further information can be found in the
[API section](api/introduction.md).

Finally, one of the main uses of this Generic Enabler is to allow developers to
add identity management (authentication and authorization) to their applications
based on FIWARE identity. This is posible thanks to
[OAuth2](https://oauth.net/2/) protocol. For more information check the
[OAuth2 API](oauth/introduction.md).

## Changes Introduced in 7.x

They biggest change introduced in 7.x is that the identity manager no longer
depends on Openstack components Keystone and Horizon. Now is fully implemented
in Node JS. Another remarkable changes have been made:

-   A driver has been implemented in order to make authentication against
    another database different from the default one.

-   The appearance of the web portal can be easily modified though configurable
    themes.

-   Now users don't need to switch session in order to create an application
    that will belong to an organization.

-   Permissions of an application can be edited or deleted. Permission could be
    define as regular expressions

-   IdM could play the role of gateway between services and eDIAS Node in order
    to allow users authentication with their national eID.

-   OAuth Refresh Token Supported.

-   Configurable OAuth token types (Permanent tokens and Json Web Tokens).

-   OAuth Revoke Token endpoint enable.

-   Internazionalization od UI (Spanish, Japanese and English supported).

-   User Admin Panel.

-   Trusted application for OAuth token validation.

-   IdM could play the role as PDP for basic authorization.

-   Complete Sign out. Delete session in services as well as in Keyrock.

-   Authentication using electronic Identification (eID) through european eIDAS
    infrastructure.

-   Data Usage Control Policies.
