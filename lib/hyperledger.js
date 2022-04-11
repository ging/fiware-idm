//const http = require('http');
//const Promise = require('bluebird');
//const config_service = require('./configService.js');
//const config = config_service.get_config().hyperledger;
const debug = require('debug')('idm:hyperledger');

/* function httpAsync(options, body) {
    return new Promise(function (resolve, reject) {
        const req = http.request(options, (res) => {
            const { statusCode } = res;
            const contentType = res.headers['content-type'];

            let e;
            if (statusCode !== 200) {
                e = new Error('Request Failed.\n' + `Status Code: ${statusCode}`);
            } else if (!/^application\/json/.test(contentType)) {
                e = new Error('Invalid content-type.\n' + `Expected application/json but received ${contentType}`);
            }
            if (e) {
                // Consume response data to free up memory
                res.resume();
                return reject(e);
            }

            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    return resolve(parsedData);
                } catch (e) {
                    return reject(e);
                }
            });
        }).on('error', (e) => {
            return reject(e);
        });
        
        if (body) {
            req.write(body || '');
        }
        
        req.end();
    });
} */

async function get_status() {
  await debug('get statuslll');
  /* try {
        const response = await httpAsync({
            hostname: hostname,
            port: port,
            path: '/status',
            method: 'GET'
            //headers
            //body -d
        });
        return response;
    } catch (error) {
        console.error(error);
        return null;
    } */
}

get_status();
