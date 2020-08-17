# Server configuration

For configuring IdM to allow the creation of data usage policies, the connection
to a PTP has to be enabled in the configuration file:

```javascript
config.usage_control = {
    enabled: true,
    ptp: {
        host: 'localhost',
        port: 8090
    }
};
```

-   enabled: set to _true_ enables the connection to the PTP.

-   ptp.host: indicates the DNS of the PTP service.

-   ptp.port: indicates the port where the PTP is listennig.
