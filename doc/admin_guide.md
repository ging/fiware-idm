# Installation and Administration Guide

- [Introduction](#introduction)
    - [Requirements](#requirements)
- [System Installation](#system-installation)
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
 git clone https://github.com/ging/fiware-idm
</pre>

- Install all required libraries using NPM.

<pre>
 cd fiware-idm
 npm install
</pre>

- Configure the installation

To configure Keyrock you can copy the file named config.js.template to config.js and edit it with the corresponding info. Below you can see an example:

<pre>
 ...
</pre>

- Launch the server:

<pre>
 npm start
</pre>

- You can also install forever.js to run it in a production environment:

<pre>
 sudo npm install forever -g
</pre>

- And then run the server using forever:

<pre>
 forever start bin/www
</pre>

- To know the status of the process you can run the next command:

<pre>
 forever status
</pre>


## System Administration

...

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

* TCP port 443 should be accessible to the web browsers in order to load the IdM Portal.

### Databases

If you have correctly populated the database when installing the GE, the connection with it is up and running.

The databases and tables needed are:

....

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
