# Sanity Check Procedures

The Sanity Check Procedures are the steps that a System Administrator will take
to verify that an installation is ready to be tested. This is therefore a
preliminary set of tests to ensure that obvious or basic malfunctioning is fixed
before proceeding to unit tests, integration tests and user validation.

## End-to-end testing

Check if User Interface is working:

1.  Verify that the host address of IdM can be reached. By default, web access
    will show a Login Page.

2.  Acquire a valid username and password and access with those credentials. The
    resulting web page is the landing page of the IdM KeyRock Portal.

3.  Verify that you can view the list of applications, organizations, etc.

Check if API is working:

1.  Request an API token as describe in
    [apiary](https://keyrock.docs.apiary.io/#reference/keyrock-api/authentication/create-token-with-password-method).
2.  Verify that you can retrieve list of applications, organization, etc. For
    instance you can check paths by:

```bash
curl --include \
     --header "X-Auth-token: <api_token>" \
  'http://idm-portal:3000/v1'
```

## Unit testing

You can also check if Keyrock is working properly by running unit test. To do
tthis, follow the next steps:

&nbsp;&nbsp;1\. Once you have copied config file, you can run all tests in this
way:

```bash
npm run test
```

&nbsp;&nbsp;&nbsp;&nbsp;1.1\. You can also run an individual test if you want:

```bash
npm run test:single test/unit/<path_to_file_test>.js
```

## List of Running Processes

If you used forever, to know the status of the process you can run the next
command:

```bash
 forever status
```

## Network interfaces Up & Open

If your run the server being HTTPS enabled the TCP port 443 should be accessible
to the web browsers in order to load the IdM Portal.

## Databases

If you have correctly populated the database when installing the GE, the
connection with it is up and running.

The databases and tables needed are:

**TABLES**

| table_names                 | table_rows |
| --------------------------- | ---------- |
| SequelizeMeta               | 30         |
| auth_token                  | 4          |
| authzforce                  | 0          |
| eidas_credentials           | 0          |
| IoT                         | 2          |
| oauth_access_token          | 9          |
| oauth_authorization_code    | 0          |
| oauth_client                | 3          |
| oauth_refresh_token         | 8          |
| oauth_scope                 | 0          |
| organization                | 0          |
| pep_proxy                   | 1          |
| permission                  | 8          |
| role                        | 2          |
| role_assignment             | 6          |
| role_permission             | 7          |
| trusted_application         | 0          |
| user                        | 3          |
| user_authorized_application | 1          |
| user_organization           | 0          |
| user_registration_profile   | 0          |

# Diagnosis Procedures

The Diagnosis Procedures are the first steps that a System Administrator will
take to locate the source of an error in a GE. Once the nature of the error is
identified with these tests, the system admin will very often have to resort to
more concrete and specific testing to pinpoint the exact point of error and a
possible solution. Such specific testing is out of the scope of this section.

## Resource availability

Verify that 2.5MB of disk space is left using the UNIX command 'df'

## Remote Service Access

Please make sure port 443 is accessible.

## Resource consumption

Typical memory consumption is 100MB and it consumes almost the 1% of a CPU core
of 2GHz, but it depends on user demand.

## I/O flows

Clients access the KeyRock Interface through the client’s Web Browser. This is
simple HTTP traffic. It makes requests to the local database.
