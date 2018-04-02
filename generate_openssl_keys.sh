#!/bin/bash
mkdir certs
openssl genrsa -out idm-2018-key.pem 2048
openssl req -new -sha256 -key idm-2018-key.pem -out idm-2018-csr.pem
openssl x509 -req -in idm-2018-csr.pem -signkey idm-2018-key.pem -out idm-2018-cert.pem
mv idm-2018-key.pem idm-2018-cert.pem idm-2018-csr.pem certs/
