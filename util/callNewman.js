import './util.js';
import * as newman from 'newman';
import toJsonSchema from 'to-json-schema';
import {assert} from 'chai'; 
import * as xmljs from 'xml-js';
import xmlFormat from 'xml-formatter';
import CryptoJS from 'crypto-js';
import {diffString} from 'json-diff';
import { SocksProxyAgent } from 'socks-proxy-agent';
import ProxyAgent from 'proxy-agent';

var instanceEnv = {}
var errorMessage = {};
// var testSet = '';
var caseName = '';
var fileName = '';
var step = '';
var requestName = '';

function AssertError(msg = "") {
    this.msg = msg;
    this.name = "AssertError";
}
AssertError.prototype = Error.prototype;

async function preReq(preRequests) {
    let collection = await readCollection(preRequests, 'preRequest')                        
    await new Promise((resolve, reject) => {
        newman.run({
            collection: collection,
            folder: preRequests,
            globals: {},
            environment: 'preRequest/' + preRequests + '/env.postman_environment.json',
            envVar: instanceEnv,
            sslClientCertList: [
                {
                    'name': 'gateway4', 'matches': global.config.certificate.host,
                    'key': {'src': global.config.certificate.key},
                    'cert': {'src': global.config.certificate.cert}
                }
            ],
            insecure: true
        })
        .on('start', (error,args)=> {
        })
        .on('request', (error,args) => {
            if(error != null){
                console.log("Call Failed");
                console.log(JSON.stringify(error, null, 4));
            }
            if(global.config.log.preRequest){
                console.log("preReq:");
                try{
                    console.log(JSON.parse(args.response.stream.toString()));
                } catch(e){
                    console.log(args.response.stream.toString());
                    console.log(error);
                }
            }
        })
        .on('exception', (error,args)=> {
            console.log("Exception:");
            console.log(args);
        })
        .on('done', (error,args)=> {
            if(global.config.log.preRequest){
                console.log("preReq result:");
                try{
                    console.log(JSON.stringify(args.environment.values.members, null, 4));
                } catch(e){
                    console.log(e);
                }
            }
            instanceEnv = JSON.parse(JSON.stringify(args.environment.values.members));
            // console.log(instanceEnv)
            if(error != null)
                console.log(error);
            resolve(args);
        });
    })

    return instanceEnv
}

async function req(iteration, testSet){
    caseName = iteration.CaseId + "_" + iteration.iterationName;
    var collectionJson = await readCollection(testSet, 'data')
    await new Promise((resolve, reject) => {  
        newman.run({
            collection: collectionJson,
            folder: iteration.CaseFolder,
            globals: {},
            environment: 'data/' + testSet + '/env.postman_environment.json',
            iterationData: [iteration],
            exportEnvironment: 'data/' + testSet + '/env.postman_environment.json',
            envVar: instanceEnv,
            // requestAgents: {
            //     https: requestAgent
            // },
            sslClientCertList: [
                {
                    'name': 'gateway4',
                    'matches': global.config.certificate.host,
                    'key': {'src': global.config.certificate.key},
                    'cert': {'src': global.config.certificate.cert}
                }
            ],
            insecure: true
        })
        // .on('start', (error,args)=> {
        // })
        .on('beforeRequest', (error,args)=> {
        })
        .on('request', (error,args) => {
            if(error != null){
                console.log("Call Failed");
                console.log(error)
            }
            step = "Step" + (args.cursor.position+1).toString().padStart(3, '0');
            requestName = args.item.name;
            fileName = testSet + '/' + (caseName + "_" + step + "_" + requestName).replace(/[/\\?%*:|"<>]/g, '');
            if (!fs.existsSync('./result/' + testSet)){
                fs.mkdirSync('./result/' + testSet);
            }

            // console.log(JSON.stringify(arg, null, 4));
            // console.log(args.response.stream.toString());

            if(global.config.log.request){
                console.log("Request Detail:");
                console.log(JSON.stringify(args.request, null, 4));
            }
            console.log(caseName + " ==> " + step + ": " + requestName + " (code: " + args.response.code + ", time: " + args.response.responseTime + "ms, size: " + args.response.responseSize + ")");
            try{
                let response = JSON.parse(args.response.stream.toString());
                saveAndVerifyResponse(response);
            } catch(err){
                // console.log(err)
                if(args.response !== undefined){
                    if(err.toString().search("no such file") < 0){
                        if(JSON.parse(xmljs.xml2json(args.response.stream.toString())).elements[0].elements[0].elements[0].name != 'ns2:transferDataResponse'){
                            console.log(err);
                        }
                        try{
                            if(err.toString().search("AssertError") > 0){
                                console.log("Response: " + args.response.stream.toString());
                                fs.writeFile('./result/' + fileName + '_response.json', args.response.stream.toString(),()=>{});
                            } else {
                                if(JSON.parse(xmljs.xml2json(args.response.stream.toString())).elements[0].elements[0].elements[0].attributes['xmlns:ns2'] != "http://ws.ipos.aiahk/") {
                                    fs.writeFile('./result/' + fileName + '_response.json', args.response.stream.toString(),()=>{});
                                    console.log("Response not JSON:\r\n" + xmlFormat(args.response.stream.toString()));
                                    console.log("Schema: not JSON response")
                                    assert.fail(step + ": " + requestName + "==>Schema not match\r\n" + schemaCheck); 
                                }
                                //Save iPoS response
                                saveAndVerifyResponse(decodeiPoSResponse(args.response.stream, args.request.body.raw));
                            }
                        } catch(e){
                            // console.log(e)
                            throw e
                        }
                    } else {
                        console.log(step + ": " + requestName + "==>No Extected Schema File Found");
                        assert.fail(step + ": " + requestName + "==>No Extected Schema File Found");
                    }
                } else {
                    console.log(step + ": " + requestName + "==>No Response Found");
                    assert.fail(step + ": " + requestName + "==>No Response Found");
                }
            }
        })
        .on('test', (error,args)=> {
            if(error != null){
                console.log("test exception:");
                console.log(error);
            }
            // console.log(JSON.stringify(args, null, 4))
        })
        // .on('beforeTest', (error,args)=> {
        //     console.log("Before Test:");
        //     if(error != null){
        //         console.log(error);
        //     }
        // })
        .on('console', (error,args)=> {
            if(global.config.log.console){
                console.log("Postman console:");
                console.log(JSON.stringify(args.messages, null, 4));
            }
        })
        // .on('prerequest', (error,args)=> {                                        
        // })
        .on('exception', (error,args)=> {
            console.log("Exception");
            console.log(args.error);
        })
        .on('assertion', (error,args)=> {
            if(args.error != null){
                console.log("\r\n\r\n!!!!!FAILED:");
                console.log('\tAssertion: ' + args.assertion);
                console.log('\tStep: ' + (args.cursor.position+1));
                console.log('\tRequest Name: ' + args.item.name);
                console.log('\tMessage: ' + args.error.message + '\r\n');
                errorMessage[args.assertion] = {
                    'step': (args.cursor.position+1),
                    'requestName': args.item.name,
                    'message': args.error.message
                };
            }  
        })
        // .on('iteration', (error,args)=> {
        //     console.log("iteration:");
        //     console.log(args);
        // })
        .on('done', (error,args)=> {
            if(error != null)
                console.log('error');
            // console.log(Object.entries(errorMessage));
            // console.log(errorMessage);
            if(Object.entries(errorMessage) != 0){
                console.log(JSON.stringify(errorMessage, null, 4));
                assert.fail(JSON.stringify(errorMessage, null, 4));
            }
                                                    
            resolve(args);
        })
    });

    return instanceEnv
}

function decodeiPoSResponse(responseStream, requestBodyRaw){
    let iPoSResponse = JSON.parse(xmljs.xml2json(responseStream.toString())).elements[0].elements[0].elements[0].elements[0].elements[0].text;
    let key = ''
    let agentCode = JSON.parse(xmljs.xml2json(requestBodyRaw)).elements[0].elements[0].elements[0].elements[1].elements[0].text
    for (var i = 0; i < 32; i++){
        key += agentCode[i%agentCode.length]
    }
    let response = JSON.parse(
        CryptoJS.AES.decrypt(
            iPoSResponse,
            CryptoJS.enc.Utf8.parse(key),
            {
                iv: CryptoJS.enc.Utf8.parse(''),
                mode: CryptoJS.mode.CBC,
                   padding: CryptoJS.pad.Pkcs7}
        ).toString(CryptoJS.enc.Utf8));
    return response;
}

async function readCollection(collectionName,location){
    try{
        return JSON.parse(fs.readFileSync(location + '/' + collectionName + '/' + collectionName + '.postman_collection.json'));
    } catch(e) {
        console.log(e)
        throw e
    }
}

function saveAndVerifyResponse(response){
    try{
        if(global.config.log.response){
            console.log("Response:");
            console.log(JSON.stringify(response, null, 4));
        }
        fs.writeFile('./result/' + fileName + '_response.json', JSON.stringify(response, null, 4),()=>{});
        let schema = toJsonSchema(response);
        if(global.config.log.schema){
            console.log("Schema:");
            console.log(JSON.stringify(schema, null, 4));
        }
        fs.writeFile('./result/' + fileName + '_schema.json', JSON.stringify(schema, null, 4),()=>{});
        if(global.config.schemaCheck){
            let expectSchema = JSON.parse(fs.readFileSync('data/' + fileName + '_schema.json'));
            let schemaCheck = diffString(schema, expectSchema);
            if(schemaCheck != ''){
                console.log("Failed: " + caseName + " > " + step + ": " + requestName + "==>Schema not match");
                console.log(schemaCheck);
                throw new AssertError("Schema not match");
            }
        }
    } catch(e) {
        console.log(e)
        throw e
    }
}

function setInstanceEnv(env){
    instanceEnv = env
}

export { preReq, req, instanceEnv, setInstanceEnv };