# Server configuration

For configuring IdM to allow users to login with their eID, the connection to a
eIDAS node has to be enabled in the configuration file:

```javascript
config.eidas = {
    enabled: true,
    gateway_host: 'localhost',
    node_host: 'https://eidas.node.es/EidasNode',
    metadata_expiration: 60 * 60 * 24 * 365 // One year
};
```

-   enabled: set to _true_ enables the connection to the eIDAS node.

-   gateway_host: indicates the DNS of the IdM service.

-   node_host: indicates the endpoint where the eIDAS node server is running.

-   metadata_expiration: expiration time for the service certificates.
