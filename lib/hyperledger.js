//const Promise = require('bluebird');
//const config_service = require('./configService.js');
//const config = config_service.get_config().hyperledger;
const debug = require('debug')('idm:hyperledger');

/*
const http = require('http');
const url = require("url");

const host = 'localhost';
const port = 11000;

let transactions="";
fetch_genesis_transations("http://localhost:9000/genesis");
console.log("["+transactions+"]");


const requestListener = function (req, res) {
    const path = url.parse(req.url, true).pathname;
    console.log(path);
    
    if(path == '/out-of-band/create-invitation'){
       // create_invitation();
        res.writeHead(200);
        res.end("hola");
    }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});

setTimeout(function(){
    console.log("["+transactions+"]");
}, 2000)

function fetch_genesis_transations(genesis_url){
    url_parts=url.parse(genesis_url, true);

    const options = {
    hostname:   url_parts.hostname,
    port: url_parts.port,
    path: url_parts.pathname,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        }
    }
    
    trans='pp';
    const req = http.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`)

        res.on('data', d => {
            transactions=String(d);
        })

        req.on('error', error => {
        console.error(error)
        })
    })

    req.end();
    return trans;
}

function create_invitation(){
    const data = JSON.stringify({
        "handshake_protocols": ["did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/didexchange/1.0"], "use_public_did": false
    })

    const options = {
    hostname: 'localhost',
    port: 11000,
    path: '/out-of-band/create-invitation',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
    }

    const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', d => {
        process.stdout.write(d)
    })
    })

    req.on('error', error => {
    console.error(error)
    })

    req.write(data)
    req.end()
}

function accepts_connection_request(){
    const connection_id = '63e01795-2cb1-486b-a17b-8b0250a327d8'; 

    const options = {
    hostname: 'localhost',
    port: 11000,
    path: '/didexchange/63e01795-2cb1-486b-a17b-8b0250a327d8/accept-request',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    }
    }

    const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', d => {
        process.stdout.write('+++++++++++'+d)
    })
    })

    req.on('error', error => {
    console.error(error)
    })

    req.end()
} */

async function get_status() {
  await debug('get status');
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
