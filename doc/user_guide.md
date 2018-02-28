

# User and Programmers Guide
+ [Introduction](#def-introduction)
+ [User Guide](#def-user-guide)
	- [Logging in](#def-logging)
	- [Applications](#def-applications)
		- [List of applications](#def-list-apps)
		- [Register an application](#def-register-app)
		- [Manage Roles](#def-managing-roles)
		- [Show application](#def-application-info)
		- [Register Pep Proxy and Iot Agents](#def-register-pep-and-iot)
		- [Authorize users and organizations](#def-authorize)
	- [Organizations](#def-organizations)
		- [List of organizations](#def-list-orgs)
		- [Create an organization](#def-create-organizations)
		- [Show organization](#def-show-organization)
		- [manage members](#def-manage-members)
+ [Programmer Guide](#def-programmer-guide)
	- [Further information](def-further-information)

<a name="def-introduction"></a>
## Introduction

This document describes the user and programming guide for Identity Management component. Here you will find the necessary steps for use the IdM portal for create an account and manage it. You will also learn about role and applications management.

<a name="def-user-guide"></a>
## User Guide

<a name="def-logging"></a>
### Logging in

Go to "Sign in" if you heave previously created an account, otherwise "Sign up" to create a new account:

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_Login.png)
<p align="center">Figure 1: IdM Log in page</p>

<a name="def-fig1"></a>
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_signup.png)
<p align="center">Figure 2: IdM Sign up page</p>

Once you have logged successfully, you will be redirect to the home page. There are two main sections, Applications and Organizations. 

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_homepage1.png)
<p align="center">Figure 3: IdM home page</p>

<a name="def-applications"></a>
### Applications

<a name="def-list-apps"></a>
#### List of applications
Look at the vertical menu on the left and click on the My Applications option. Here you can see the application in which you are authorized. You can also select one of the organizations to which the user belongs and show all its applications.
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_index_apps1.png)
<p align="center">Figure 4: List user applications</p>

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_index_apps2.png)
<p align="center">Figure 5: List organization applications</p>

<a name="def-register-app"></a>
#### Register an application
In home page, in the Applications section you can register new application by clicking on "Register". You can also register an application from My Application page.
<a name="def-fig2"></a>
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_homepage2.png)
<p align="center">Figure 6: Home register an application</p>

In the next step you have to give the application a name, description, URL and callback URL - required by the OAuth 2.0 Protocol. You also have to choose how is going to be the provider of the application: yourself or one of the organizations in which you are owner.

<a name="def-fig7"></a>
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_register_app.png)
<p align="center">Figure 7: KeyRock Register Application</p>

Click on "Next" ([Figure 7](#def-fig7)).

In the second step the application's logo will be loaded by selecting a valid file type. You have the option to re-frame the chosen image.

Click on "Crop Image" when you complete this process and then click "Next" as shown on [Figure 9](#def-fig9).

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_upload_logo.png)
<p align="center">Figure 8: Upload logo Application</p>

<a name="def-fig9"></a>
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_reframe_logo.png)
<p align="center">Figure 9: Crop image</p>

In the third step we set up the roles and permissions of the application. In the next section it is explained.

<a name="def-managing-roles"></a>
#### Manage roles

In this page you will find two default roles: Provider and Purchaser. If you click in one of this roles you will see the permissions assigned to that role.
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_application_roles.png)
 <p align="center">Figure 10: List of roles and permissions</p>

You are also able to create new roles and permissions.
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_application_roles_permissions.png)
 <p align="center">Figure 11: Create roles and permissions</p>

To create a new role click on "New role" and write the name of role, after that click "Save".
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_application_roles_create.png)
 <p align="center">Figure 12: Create a role</p>

You are also permitted to add up new permissions by clicking on "New Permission". Here you need to enter the name of the permission, description, HTTP verb (GET, PUT, POST, DELETE) and the Path to that permission. Click "Create Permission" and "Finish" to finalize with creating the application.
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_application_permissions_create.png)
 <p align="center">Figure 13: Create a permission</p>
You can also configured a specific XACML rule if you need it.

In addition you can edit and delete all the roles and permissions that you have created by clicking in the corresponding buttons.

You can configure the permissions for the new role by activating the correspondng check box. Click "Save" button to create the new assignment.
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_application_role_permission_assignment.png)
<p align="center">Figure 14: KeyRock New assignment</p>

<a name="def-application-info"></a>
#### Show application
Once you have created an application, you are redirected to the page where all the information is displayed. You can also access this information by clicking in the corresponding application from the My Applications page. The Oauth2 credentials of the application are displayed in this page.

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_application_show.png)
<p align="center">Figure 15: Application view</p>

You can also perform several actions:

 - Edit the application. Here you can change applications attributes: name, description, url, redirect_uri and logo.
 - Manage roles. Explained in the previous section.
 - Register a Pep Proxy.
 - Register an Iot Agent.
 - Authorize users.
 - Authorize organizations.

<a name="def-register-pep-and-iot"></a>
#### Register Pep Proxy and Iot Agents
For each application you can register a Pep Proxy in order to enable authentication and authorization via Oauth2. You can also register some IoT agents in the application to provide lightweight security mechanisms to yours IoT devices.
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_register_pep_iot.png)
<p align="center">Figure 16: Pep Proxy and Iot Agents register</p>

You can also reset passwords of this  components or delete them.
<a name="def-authorize"></a>
#### Authorize users and organizations

You can add users or organizations in the application by clicking on the "Authorize" button.
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_authorize.png)
<p align="center">Figure 17: KeyRock authorize</p>
It shows a modal where you can manage Users and Groups. You can see the users or organizations and their initially assigned roles. You can search users or organizations in the right column. Note that you can assign roles after the user or organization have been added, by clicking on the roles drop down menu - below the user's icon, as shown on Figure 18 and Figure 19.

<a name="def-fig18"></a>
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_authorize_users.png)
<p align="center">Figure 18: KeyRock Authorize users</p>

<a name="def-fig19"></a>
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_authorize_organizations.png)
<p align="center">Figure 19: KeyRock Authorize organizations</p>

When you assign roles to an organization, you assign it to the users who are owners or memebers of the application. In next section is explained more in detail how to manage organizations.

<a name="def-organizations"></a>
### Organizations

<a name="def-list-orgs"></a> 
#### List organizations
Look again at the vertical menu on the left and click on the Organizations option. Here you can see all organizations to which the user belongs. 

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_index_organizations.png)
<p align="center">Figure 20: KeyRock list organizations</p>

Click the "Create" button to create a new organization.
 
<a name="def-create-organizations"></a>
#### Create organization
In order to create an organization you need to specify a name and a description of it and then click on the "Create Organization" button.
 
 ![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_create_organization.png)
<p align="center">Figure 21: KeyRock create organization</p>

<a name="def-show-organization"></a>
#### Show organization

You are now redirected to the Home menu on behalf of the newly created organization. Here you can see the several attributes of the organization.
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_organization_show.png)
<p align="center">Figure 22: KeyRock Organization view</p>

You can also perform several actions:

 - Edit the organization. Here you can: name, description, url and logo.
 - Manage members.

<a name="def-manage-members"></a>
#### Manage members
If you click on the "Manage" button in the show view a modal is openned. In this modal you can search users to add to the organization. You can assign them the owner role or the member role. Only the owners of the organization can edit or add new members to it.
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_organization_members.png)
<p align="center">Figure 23: KeyRock Organization view</p>

<a name="def-programmer-guide"></a>
## Programmer Guide

<a name="def-further-information"></a>
### Further information

For further information on KeyRock, please refer to the step-by-step video at [Help & Info Portal](http://help.lab.fiware.org/) choosing “Account”, as [Figure 24](#def-fig24)

<a name="def-fig24"></a>
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/UserGuide_screencast.png)
<p align="center">Figure 24: KeyRock Screencast</p>