# Introduction

## Enable HTTPS

Follow the next steps in order to enable the server to listen to HTTPS requests.

-   Generate OpenSSL certificates.

```bash
./generate_openssl_keys.sh
```

-   Enable HTTPS in config.js.

```javascript
config.https = {
    enabled: true,
    cert_file: "certs/idm-2018-cert.pem",
    key_file: "certs/idm-2018-key.pem",
    port: 443
};
```

-   Start server with admin rights

```bash
sudo npm start
```

## External Authentication

You can also configure the Identity Manager to authenticate users through an
external database.

When using this option, after the user correclty authenticates using his/her
remote credentials, a local copy of the user is created. For authenticating the
user externally Keyrock needs to read a set of user attributes from the external
database. These attributes are:

-   id: A unique identifier of the user. The local copy of the user will have an
    identifier with the result of concatenating the configured prefix
    (_config.external_auth.id_prefix_) and the external ID.
-   username: the display name of the user
-   email: the email address is the value used for authenticating the user
-   password: the encrypted password of the user
-   password*salt: if not specified, the value set in
    \_config.external_auth.password_encryption_key* will be used for checking
    the password encryption.

It is very common that the external database does not have a table with these
parameters. In such case you can create a database view for exposing them.

If your external database has the user data separated in two tables named
_USERS_ and _ACTORS_ with the following structure:

**USERS Table**

| ID  | encrypted_password | password_salt | created_at               | last_sign_in_at          | actor_id |
| --- | ------------------ | ------------- | ------------------------ | ------------------------ | -------- |
| 1   | g34h432hjk54k2j    | 1234          | 2015-06-10 08:26:02.0113 | 2018-06-10 08:26:02.0113 | 12       |
| 2   | 2h43h7fdj38302j    | 1234          | 2015-01-10 08:26:02.0113 | 2018-01-10 08:26:02.0113 | 22       |
| 3   | j328478j328j423    | 1234          | 2015-02-10 08:26:02.0113 | 2018-10-10 08:26:02.0113 | 5        |

**ACTORS Table**

| ID  | name          | email           | logo                   |
| --- | ------------- | --------------- | ---------------------- |
| 12  | Melinda López | melinda@test.es | http://mylogo.es/12344 |
| 22  | Juanli Jons   | juanli@test.es  | http://mylogo.es/12121 |
| 5   | Lesha Magnen  | lesha@test.es   | http://mylogo.es/1212  |

You can create a view with the SQL statement

```
CREATE VIEW USER_VIEW AS
	SELECT USERS.id, USERS.password_salt, USERS.encrypted_password as password, ACTORS.email, ACTORS.name as username
    FROM USERS,ACTORS
    WHERE USERS.actor_id = ACTORS.id;
```

And this will create a view with the structure Keyrock needs to authenticate
users:

**USER_VIEW Table**

| ID  | password_salt | password        | email           | username      |
| --- | ------------- | --------------- | --------------- | ------------- |
| 1   | 1234          | g34h432hjk54k2j | melinda@test.es | Melinda López |
| 2   | 1234          | 2h43h7fdj38302j | juanli@test.es  | Juanli Jons   |
| 3   | 1234          | j328478j328j423 | lesha@test.es   | Lesha Magnen  |

For enabling this external authentication you have to modify config.js file
customizing the database attributes.

```javascript
config.external_auth = {
    enabled: true,
    id_prefix: "external_",
    password_encryption_key: undefined,
    ecryption: "bcyrpt",
    database: {
        host: "localhost",
        port: undefined,
        database: "idm",
        username: "root",
        password: "idm",
        user_table: "user_view",
        dialect: "mysql"
    }
};
```

The way to check password validity can be customized in with parameter
_external_auth.encryption_. SHA1 and BCrypt are currently supported.

## Authorization

Configure Policy Decision Point (PDP)

-   IdM can perform basic policy checks (HTTP verb + path)
-   AuthZForce can perform basic policy checks as well as advanced

If authorization level is advanced you can create rules, HTTP verb+resource and
XACML advanced. In addition you need to have an instance of authzforce deployed
to perform advanced authorization request from a Pep Proxy. If authorization
level is basic, only HTTP verb+resource rules can be created

In order to allow this characteristic you need to edit the config file:

```javascript
config.authorization = {
    level: "basic", // basic|advanced
    authzforce: {
        enabled: false,
        host: "localhost",
        port: 8080
    }
};
```

## Email

You can configure the IdM to send emails to users. Follow this
[tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-and-configure-postfix-as-a-send-only-smtp-server-on-ubuntu-14-04)
to configure Postfix as a Send-Only SMTP Server on Ubuntu 14.04. Then edit
config file:

```javascript
config.mail = {
    host: "idm_host",
    port: 25,
    from: "noreply@host"
};
```

## Configure themes

You can customize the appearance of the web portal. By default there are two
themes: default and fiwarelab.

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/AdminGuide_default_view.png)

<p align="center">Figure 1: IdM default view</p>

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/AdminGuide_fiware_view.png)

<p align="center">Figure 2: IdM fiware view</p>

You can change between these themes in config.js

```javascript
config.site = {
    title: "Identity Manager",
    theme: "default" // default/fiwarelab
};
```

Additionally you can customize your own theme. In order to do that follow these
steps:

-   Create a new subfolder in themes directory

```bash
mkdir themes/example
```

-   Generate \_colors.scss, \_styles.scss and style.scss

```bash
cd themes/example && touch _colors.scss _styles.scss style.scss
```

-   Add these lines to style.scss

```css
/****************************** Default colors */
@import "../default/colors";

/****************************** Custom colors */
@import "colors";

/****************************** Default styles */
@import "../default/styles_call";

/****************************** Custom styles */
@import "styles";
```

-   Edit \_colors.scss. For example:

```css
/****************************** Custom colors rewrite */

$brand-primary: purple;
$brand-secundary: orange;
```

-   Change config.site to use the new theme:

```javascript
config.site = {
    title: "Identity Manager",
    theme: "example" // default/fiwarelab
};
```

Run the Identity manager and you will see the new appearance:

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/AdminGuide_customize_view.png)

<p align="center">Figure 3: IdM custom view</p>

You can also configure a new logo in \_styles.scss.

```css
/****************************** Custom styles rewrite */

.logo-header .brand {
    background-image: url(../img/example.png);
    width: 150px;
    background-size: 150px 37px;
}

.logo-header {
    float: left;
}

.presentation {
    .media {
        height: auto;
        footer {
            margin-top: 15px;
        }
    }
}
```

Furthermore you can customize the header, footer, presentation and help of your
portal. To do that create a folder, generate files and then customize them.

```bash
mkdir themes/example/templates
cd themes/example/templates && touch _footer.ejs _header.ejs _presentation.ejs _help_about_items.ejs
```

## Admin Panel

Keyrock provides an interface in which administrators could easliy manage the
users accounts. Actions as create, edit, delete, enable users as well as reset
passwords of them could be performed through this functionality.

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/AdminGuide_admin_panel.png)
