## List of applications

Look at the vertical menu on the left and click on the "My Applications" option.
Here you can see the application in which you are authorized. You can also
select one of the organizations to which the user belongs and show all its
applications.

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_index_apps1.png)

<p style="text-align: center;">Figure 4: List user applications</p>

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_index_apps2.png)

<p style="text-align: center;">Figure 5: List organization applications</p>

## Register an application

In home page, in the Applications section you can register new application by
clicking on "Register". You can also register an application from My Application
page.

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_homepage2.png)

<p style="text-align: center;">Figure 6: Home register an application</p>

There are several attributes that are mandatory:

-   Name.

-   Description.

-   URL.

-   Callback URL. Required by the OAuth 2.0 Protocol

-   Provider. You have to choose who is going to be the provider of the
    application: yourself or one of the organizations in which you are owner.

Although the rest of attributes are not mandatory, it is important to understand
its functionality:

-   Sign-out Callback URL. This is the URL to which Keyrock will redirect a user
    if a sign out is performed from a service. If it is not configured, it will be
    redirected to the domain indicated in URL parameter. See more information
    under [sign out oauth section](../oauth/sign_out_oauth_service.md#sign-out)

-   Grant Type. You can select the different ways of obtaining an OAuth Access
    Token. Check
    [Connecting to IdM with OAuth2.0](../oauth/oauth_documentation.md#introduction).

-   eIDAS Authentication. This attribute allows your service to authenticate
    users by their eID. See more information in
    [Connecting IdM to a eIDAS Node Section](../eidas/introduction.md#introduction).

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_register_app.png)

<p style="text-align: center;">Figure 7: KeyRock Register Application</p>

Click on "Next".

In the second step the application's logo will be loaded by selecting a valid
file type. You have the option to re-frame the chosen image.

Click on "Crop Image" when you complete this process and then click "Next".

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_upload_logo.png)

<p style="text-align: center;">Figure 8: Upload logo Application</p>

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_reframe_logo.png)

<p style="text-align: center;">Figure 9: Crop image</p>

In the third step we set up the roles and permissions of the application. In the
next section it is explained.

## Manage roles

In this page you will find two default roles: Provider and Purchaser. If you
click in one of these roles, you will see the permissions assigned to that role.

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_application_roles.png)

<p style="text-align: center;">Figure 10: List of roles and permissions</p>

You are also able to create new roles and permissions.

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_application_roles_permissions.png)

<p style="text-align: center;">Figure 11: Create roles and permissions</p>

To create a new role click on "New role" and write the name of role, after that
click "Save".

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_application_roles_create.png)

<p style="text-align: center;">Figure 12: Create a role</p>

You are also permitted to add up new permissions by clicking on "New
Permission". Here you need to enter the name of the permission, description,
HTTP verb (GET, PUT, POST, DELETE, or PATCH), and the Resource, the path from
which you are requesting permission to your service. This path could also be a 
regular expression, to that permission. Click "Create Permission" and "Finish" to
finalize with creating the application. Regular expressions are pattern used to 
match character combinations in strings. Yoy can get details about regular 
expression syntax in the following [cheatsheet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Cheatsheet).

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_application_permissions_create.png)

<p style="text-align: center;">Figure 13: Create a permission</p>

You can also configure a specific XACML rule if you need it.

In addition, you can edit and delete all the roles and permissions that you have
created by clicking in the corresponding buttons.

You can configure the permissions for the new role by activating the
corresponding check box. Click "Save" button to create the new assignment.

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_application_role_permission_assignment.png)

<p style="text-align: center;">Figure 14: KeyRock New assignment</p>

## Show application

Once you have created an application, you are redirected to the page where all
the information is displayed. You can also access this information by clicking
in the corresponding application from "My Applications page". The Oauth2
credentials of the application are displayed in this page.

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_application_show.png)

<p style="text-align: center;">Figure 15: Application view</p>

You can also perform several actions:

-   Edit the application. Here you can change applications attributes: name,
    description, url, redirect_uri and logo.

-   Manage roles. Explained in the previous section.

-   Register a Pep Proxy.

-   Register an IoT Agent.

-   Authorize users.

-   Authorize organizations.

-   Authorize trusted applications.

## Register Pep Proxy and IoT Agents

For each application you can register a Pep Proxy in order to enable
authentication and authorization via Oauth2. You can also register some IoT
agents in the application to provide lightweight security mechanisms to yours
IoT devices.

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_register_pep_iot.png)

<p style="text-align: center;">Figure 16: Pep Proxy and Iot Agents register</p>

You can also reset passwords of these components or delete them.

## Authorize users and organizations

You can add users or organizations in the application by clicking on the
"Authorize" button.

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_authorize.png)

<p style="text-align: center;">Figure 17: KeyRock authorize</p>

It shows a modal where you can manage Users and Groups. You can see the users or
organizations and their initially assigned roles. You can search users or
organizations in the right column. Note that you can assign roles after the user
or organization have been added, by clicking on the roles drop down menu - below
the user's icon, as shown on Figure 18 and Figure 19.

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_authorize_users.png)

<p style="text-align: center;">Figure 18: KeyRock Authorize users</p>

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_authorize_organizations.png)

<p style="text-align: center;">Figure 19: KeyRock Authorize organizations</p>

When you assign roles to an organization, you assign it to the users who are
owners or members of the application. In next section is explained more in
detail how to manage organizations.

## Authorize trusted applications

When validating permissions in
[Keyrock's built-in PDP](../installation_and_administration_guide/configuration.md#authorization)
as explained [here](../oauth/oauth_documentation.md#validate-authorization) the
application in which the permission was created and assigned to the user is
checked.

Keyrock allows application owners to trust in other applications. Thus, a PDP
check will validate if the user has a specific permission in the current
application or in one of the applications in which it trusts. For adding trusted
applications you can use the API or the web interface:

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_trusted_applications.png)

<p style="text-align: center;">Figure 20: KeyRock Trusted Applications</p>
