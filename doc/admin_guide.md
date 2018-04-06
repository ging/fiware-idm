

# Installation and Administration Guide

- [Introduction](#introduction)
    - [Requirements](#requirements)
- [System Installation](#system-installation)
	- [Enable HTTPs](#configure-themes)
	- [External Authentication](#external-authentication)
	- [Authzforce](#authzforce)
	- [Configure Themes](#configure-themes)
- [System Administration](#system-administration)
- [Sanity Check Procedures](#sanity-check-procedures)
    - [End to End testing](#end-to-end-testing)
    - [List of Running Processes](#list-of-running-processes)
    - [Network interfaces Up & Open](#network-interfaces-up--open)
    - [Databases](#databases)
- [Diagnosis Procedures](#diagnosis-procedures)
    - [Resource availability](#resource-availability)
    - [Remote Service Access](#remote-service-access)
    - [Resource consumption](#resource-consumption)
    - [I/O flows](#io-flows)

## Introduction

Welcome to the Installation and Administration Guide for the Identity Management - KeyRock Generic Enabler. This section will cover how to install, configure and administrate a working instance of KeyRock.

### Requirements

In order to execute Keyrock, it is needed to have previously installed the following software:

 - Node.js (http://nodejs.org/download/).
 - Node Packaged Modules. It is usually included within Node.js (https://npmjs.org/).
 - MySQL (https://www.mysql.com/)


## System Installation

The following steps need to be performed to get Keyrock up and running:

- Download the software, using [GitHub](http://github.com/ging/fiware-idm).
<pre>
<code>git clone https://github.com/ging/fiware-idm</code>
</pre>

- Install all required libraries using NPM.
<pre>
<code>cd fiware-idm
npm install</code>
</pre>

 - Configure the installation. To configure Keyrock you can copy the file named config.js.template to config.js.
<pre>
<code>cp config.js.template config.js</code>
</pre>

 - Edit it with the corresponding with basic info. Below you can see an example: 
	
Configure port and host:		
~~~
	config.host = 'http://localhost:3000';
	config.port = 3000
~~~
Configure database:
~~~
	config.database = {
		host: 'localhost',
		password: 'idm',
		username: 'root',
		database: 'idm',
		dialect: 'mysql'
	}
~~~
Configure session key:
~~~
	config.session = {
		secret: 'nodejs_idm'
	}
~~~
Configure password encryption:
~~~
	config.password_encryption = {
		key: 'nodejs_idm'
	}
~~~
Configure email:
~~~
	config.mail = {
	    host: 'idm_host',
	    port: 25,
	    from: 'noreply@host'
	}
~~~
 - Create database, run migrations and seeders:
<pre>
<code>npm run-script create_db
npm run-script migrate_db 
npm run-script seed_db </code>
</pre>

 - Launch the server:
<pre>
<code>npm start</code>
</pre>

- You can also install forever.js to run it in a production environment:
<pre>
<code>sudo npm install forever -g</code>
</pre>

- And then run the server using forever:
<pre>
<code>forever start bin/www</code>
</pre>

- To know the status of the process you can run the next command:
<pre>
<code>forever status</code>
</pre>

### Enable HTTPs
Follow the next steps in order to enable the server to listen to HTTPs requests.

 - Generate OpenSSL certificates.
<pre>
<code>./generate_openssl_keys.sh</code>
</pre>

 - Enable HTTPs in config.js.
~~~
	config.https = {
	    enabled: true,
	    cert_file: 'certs/idm-2018-cert.pem',
	    key_file: 'certs/idm-2018-key.pem',
	    port: 443
	}
~~~
 - Start server with admin rights
<pre>
<code>sudo npm start</code>
</pre>

### External Authentication
You can also configure the Identity Manager to authenticate users through other database.

 - Copy file named custom_authentication_driver.js.template to custom_authentication_driver.js
<pre>
<code>cp helpers/custom_authentication_driver.js.template helpers/custom_authentication_driver.js</code>
</pre>

- Edit custom_authentication_driver.js according to your user table schema.
- Enable use of driver in config.js file and customize database attributes.
~~~
	config.external_auth = {
	    enabled: true,
	    authentication_driver: 'custom_authentication_driver',
	    database: {
	        host: 'localhost',
	        database: 'idm',
	        username: 'root',
	        password: 'idm',
	        user_table: 'user',
	        dialect: 'mysql'
	    }
	}
~~~

### Authzforce 
If you have an authzforce instance deployed you can enable the Identity Manager to automatically send requests to the Authzforce PAP in order to create the corresponding policies. Edit config file to perform these actions.
~~~
	config.authzforce = {
		enabled: true,
		host: 'localhost',
		port: 8080
	}
~~~

### Configure themes
You can customize the appearance of the web portal. By default there are two themes: default and fiwarelab.
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/AdminGuide_default_view.png)
<p align="center">Figure 1: IdM default view</p>

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/AdminGuide_fiware_view.png)
<p align="center">Figure 2: IdM fiware view</p>

You can change between these themes in config.js
~~~
	config.site = {
	    title: 'Identity Manager',
	    theme: 'default'   // default/fiwarelab
	};
~~~

Additionally you can customize your own theme. In order to do that follow these steps:

 - Create a new subfolder in themes directory
<pre>
<code>mkdir themes/example</code>
</pre>
 - Generate _colors.scss, _styles.scss and style.scss
<pre>
<code>cd themes/example && touch _colors.scss _styles.scss style.scss</code>
</pre>
 - Add these lines to style.scss
~~~
/****************************** Default colors */
@import "../default/colors";

/****************************** Custom colors */
@import "colors";

/****************************** Default styles */
@import "../default/styles_call";

/****************************** Custom styles */
@import "styles"
~~~

 - Edit _colors.scss. For example:
~~~
/****************************** Custom colors rewrite */

$brand-primary: purple;
$brand-secundary: orange;
~~~
 - Change config.site to use the new theme:
~~~
	config.site = {
	    title: 'Identity Manager',
	    theme: 'example'   // default/fiwarelab
	};
~~~
Run the Identity manager and you will see the new appearance:
![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/AdminGuide_customize_view.png)
<p align="center">Figure 3: IdM custom view</p>

You can also configure a new logo in _styles.scss.
~~~
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
~~~
Furthermore you can customize the header, footer, presentation and help of your portal. To do that create a folder, generate files and then customize them.
<pre>
<code>mkdir themes/example/templates
cd themes/example/templates && touch _footer.ejs _header.ejs _presentation.ejs _help_about_items.ejs</code>
</pre>



## System Administration
To manage the mysql database you can access the console running the following command and introducing the mysql password:
<pre>
<code>mysql -u [mysql_host] -u [username] -p</code>
</pre>


## Sanity Check Procedures

The Sanity Check Procedures are the steps that a System Administrator will take to verify that an installation is ready to be tested. This is therefore a preliminary set of tests to ensure that obvious or basic malfunctioning is fixed before proceeding to unit tests, integration tests and user validation.

### End to End testing

1. Verify that the host address of IdM can be reached. By default, web access will show a Login Page.
2. Acquire a valid username and password and access with those credentials. The resulting web page is the landing page of the IdM KeyRock Portal.
3. Verify that you can view the list of applications, organizations, etc.

### List of Running Processes

- If you used forever, to know the status of the process you can run the next command:

<pre>
 forever status
</pre>

### Network interfaces Up & Open

* If your run the server being HTTPs enabled the TCP port 443 should be accessible to the web browsers in order to load the IdM Portal.

### Databases

If you have correctly populated the database when installing the GE, the connection with it is up and running.

The databases and tables needed are:

![](https://raw.githubusercontent.com/ging/fiware-idm/master/doc/resources/AdminGuide_database_table.png)
<p align="center">Figure 4: IdM databases table</p>

## Diagnosis Procedures

The Diagnosis Procedures are the first steps that a System Administrator will take to locate the source of an error in a GE. Once the nature of the error is identified with these tests, the system admin will very often have to resort to more concrete and specific testing to pinpoint the exact point of error and a possible solution. Such specific testing is out of the scope of this section.

### Resource availability

* Verify that 2.5MB of disk space is left using the UNIX command 'df'

### Remote Service Access

Please make sure port 443 is accessible.

### Resource consumption

Typical memory consumption is 100MB and it consumes almost the 1% of a CPU core of 2GHz, but it depends on user demand.

### I/O flows

Clients access the KeyRock Interface through the client’s Web Browser. This is simple HTTP traffic. It makes requests to the local database.
