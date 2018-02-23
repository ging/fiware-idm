# User and Programmers Guide

- [Introduction](#introduction)
- [User Guide](#user-guide)
- [Programmer Guide](#programmer-guide)

## Introduction

This document describes the user and programming guide for Keyrock Identity Management component. Here you will find the necessary steps for use the Keyrock portal for create an account and manage it. You will also learn about role and applications management.

<a name="def-user-guide"></a>
## User Guide

### Logging in

Go to "Sign in" if you heave previously created an account, otherwise "Sign up" to create a new account:

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/KeyRock.png)

<a name="def-fig1"></a>
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/KeyRock_signup.png)
<p align="center">Figure 1: KeyRock Login Page</p>

[Figure 1](#def-fig1) shows the homepage after you log in successfully.

There are two main sections, Applications and Organizations. In the Applications section you can register new application by clicking on "Register".

<a name="def-register-app"></a>
### Registering an application

<a name="def-fig2"></a>
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/KeyRock_homepage.png)
<p align="center">Figure 2: KeyRock Home Page</p>

In the next step you have to give the application a name, description, URL and callback URL - required by the OAuth 2.0 Protocol.

Click on "Next" ([Figure 3](#def-fig3)).

<a name="def-fig3"></a>
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/KeyRock_register_app.png)
<p align="center">Figure 3: KeyRock Register Application</p>

In the second step the application's logo will be loaded by selecting a valid file type. You have the option to re-frame the chosen image.

Click on "Crop Image" when you complete this process and then click "Next" as shown on [Figure 4](#def-fig4).

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/KeyRock_upload_logo.png)

<a name="def-fig4"></a>
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/KeyRock_reframe_logo.png)
<p align="center">Figure 4: KeyRock Edit Application Logo</p>

In the third step we set up the roles and permissions of the application. You will find the two possible roles: Provider and Purchaser.

You can edit the permission for each of the roles or create new roles. Click on "New role" and write the name of role, after that click "Save".

You can configure the permissions for the new role by activating the corresponding check box.

You are also permitted to add up new permissions by clicking on "New Permission". Here you need to enter the name of the permission, description, HTTP verb (GET, PUT, POST, DELETE) and the Path to that permission, Figure 5.

Click "Create Permission" and "Finish" to finalize with creating the application.

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/KeyRock_new_role.png)

<a name="def-fig5"></a>
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/KeyRock_new_permission.png)
<p align="center">Figure 5: KeyRock New Roles and Permissions</p>

### Managing roles

Look at the vertical menu on the left (Figure 6). You went from Home to Applications. Here you can see the application you've just created.

At the bottom you can manage the roles of the users. You can add new users on the "Add" button.

It shows a modal where you can manage Users and Groups. You can see the users and their initially assigned roles.

Choose users and groups to add to the application, then choose their initial role. Click "Add".

Note that you can assign roles after the users have been added, by clicking on the roles drop down menu - below the user's icon, as shown on [Figure 6](#def-fig6).

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/KeyRock_application_summary.png)

<a name="def-fig6"></a>
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/KeyRock_add_members.png)
<p align="center">Figure 6: KeyRock Add Members to Application</p>

### Managing organizations

Next head on to the vertical menu and click "Organizations". Click "Create Organization" to register a new organization.

Add the name, choose the owner and write the description of the organization. Click "Create Organization".

You are now redirected to the Home menu on behalf of the newly created organization. Any new application created now, will belong to the organization.

To return to the home of the user go up in the header and click on the name of the organization. Select "Switch session", [Figure 7](#def-fig7).

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/KeyRock_create_organization.png)

<a name="def-fig6"></a>
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/KeyRock_switch_session.png)
<p align="center">Figure 7: KeyRock Create Organization</p>

## Programmer Guide

### Further information

For further information on KeyRock, please refer to the step-by-step video at [Help & Info Portal](http://help.lab.fiware.org/) choosing “Account”, as [Figure 8](#def-fig8)

<a name="def-fig8"></a>
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/KeyRock_screencast.png)
<p align="center">Figure 8: KeyRock Screencast</p>