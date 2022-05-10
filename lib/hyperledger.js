//const Promise = require('bluebird');
//const config_service = require('./configService.js');
//const config = config_service.get_config().hyperledger;
/* const debug = require('debug')('idm:hyperledger');


const http = require('http');
const url = require("url");

schema_data="";
credential_data="";
invitation_data="";

function create_schema(schema_name,schema_version){
    return new Promise(function (resolve, reject) {
        const data = JSON.stringify({
            "attributes": ["name","age"],"schema_name": schema_name,"schema_version": schema_version
        })

        const options = {
        hostname: 'localhost',
        port: 11000,
        path: '/schemas',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
        }

        const req = http.request(options, res => {

        res.on('data', d => {
            process.stdout.write(d)
            schema_data=String(d);
            resolve();
        })
   
        })
     
        req.on('error', error => {
        reject(error)
        })

        req.write(data)
        req.end()
    });
} 

function create_credential(schema_id){
    
    return new Promise(function (resolve, reject) {
      
        const data = JSON.stringify({
            "schema_id": schema_id ,"tag": "default"
        })

        const options = {
        hostname: 'localhost',
        port: 11000,
        path: '/credential-definitions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
        }

        const req = http.request(options, res => {

        res.on('data', d => {
            process.stdout.write(d)
            credential_data=String(d);
            resolve();
        })
        })

        req.on('error', error => {
            reject(error)
            })

        req.write(data)
        req.end()
    }); 
}
function create_invitation(){
    return new Promise(function (resolve, reject) {
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

        res.on('data', d => {
            process.stdout.write(d)
            invitation_data=String(d);
            resolve();
        })
        })

        req.on('error', error => {
        reject(error)
        })

        req.write(data)
        req.end()
    }); 
}




exports.init = function(){
    create_schema("schema4","2.0").then(function (status) {
        data=JSON.parse(schema_data);
        create_credential(data.sent.schema_id).then(function (status) {
            create_invitation();
        })
})
.catch(function (error) {
 console.log(error);
});
} */
