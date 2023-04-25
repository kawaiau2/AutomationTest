import * as newman from 'newman';
import {assert} from 'chai'; 
import * as fs from 'fs';
import toJsonSchema from 'to-json-schema';
import csvtojson from 'csvtojson';
import {diffString} from 'json-diff';
import '../util/util.js';
import * as xmljs from 'xml-js';
import xmlFormat from 'xml-formatter';
import CryptoJS from 'crypto-js';
import jsonIndex from 'data-query';
import { SocksProxyAgent } from 'socks-proxy-agent';
import ProxyAgent from 'proxy-agent';
import { parse } from 'path';

function AssertError(msg = "") {
    this.msg = msg;
    this.name = "AssertError";
}
AssertError.prototype = Error.prototype;

let config = global.config;

let instanceEnv = global.config.env;

let testSuite = global.testSuite;
for(let j=0; j < testSuite.length; j++){
    if(testSuite[j].skip !='y' && testSuite[j].skip !='Y'){
        let testSet =testSuite[j].scenario;
        csvtojson().fromFile('data/' + testSet + '/iterationfile.csv').then();
        let data = await csvtojson().fromFile('data/' + testSet + '/iterationfile.csv');

        describe(testSet, () => {
            let collectionJson = fs.readFileSync('data/' + testSet + '/' + testSet + '.postman_collection.json');
            let stages = ['initEnv', 'preReq', 'req'];
            let runCount = 0;
            data.forEach(iteration => {
                if(iteration.skip != 'y' && iteration.skip != 'Y'){
                    it(iteration.CaseId + ": " + iteration.iterationName, async function() {
                        global.iteration = iteration;
                        let errorMessage = {};
                        let caseName = iteration.CaseId + "_" + iteration.iterationName;
                        let caseHeader = caseName + " ==> "
                        console.log(caseHeader + "start>>>>>");
                        for(let i=0;i<stages.length;i++){
                            switch(stages[i]){
                                case 'initEnv':
                                    console.log(caseHeader + stages[i]+'>>>>>>');
                                    // console.log(iteration);
                                    Object.keys(iteration).forEach(function(key){
                                        instanceEnv = instanceEnv.filter(el => el['key'] != key);
                                        instanceEnv.push({type:'any', value:iteration[key], key:key });
                                    })
                                    // console.log(instanceEnv)
                                    if(iteration.preIteration != '' && iteration.preIteration != null){
                                        try{
                                            const preIteration = await import ('../common/' + iteration.preIteration);
                                            instanceEnv = preIteration.initEnv(iteration, testSet, instanceEnv, runCount);
                                            runCount++;
                                        } catch(e){
                                            console.log(e);
                                        }
                                        iteration = global.iteration;
                                        if(global.config.log.initEnv){
                                            console.log("initEnv:");
                                            console.log(instanceEnv);
                                            console.log(iteration);
                                        }
                                    }
                                    break;
                                case 'preReq':
                                    console.log(caseHeader + stages[i]+'>>>>>>');
                                    if(iteration.preRequest!= '' && iteration.preRequest!= null){
                                        let preRequests = iteration.preRequest.split(';');
                                        for (let k=0; k < preRequests.length; k++){
                                            let collection = JSON.parse(fs.readFileSync('preRequest/' + preRequests[k] + '/' + preRequests[k] + '.postman_collection.json'));
                                            
                                            await new Promise((resolve, reject) => {
                                                newman.run({
                                                    collection: collection,
                                                    folder: preRequests[k],
                                                    globals: {},
                                                    environment: 'preRequest/' + preRequests[k] + '/env.postman_environment.json',
                                                    exportEnvironment: 'preRequest/' + preRequests[k] + '/env.postman_environment.json',
                                                    envVar: instanceEnv,
                                                    sslClientCertList: [{'name': 'gateway4', 'matches': global.config.certificate.host, 'key': {'src': global.config.certificate.key}, 'cert': {'src': global.config.certificate.cert}}],                                                    insecure: true
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
                                        }
                                    }
                                    break;
                                case 'req':
                                    console.log(caseHeader + stages[i]+'>>>>>>');
                                    // const postIteration = await import ('../common/posttest.js');
                                    // const postTesttc = await import('../common/posttestcase.js');
                                    // const requestAgent = new SocksProxyAgent({ hostname: 'localhost', port: '8888' });
                                    // const requestAgent = new SocksProxyAgent('socks://localhost:8888');
                                    // const requestAgent = new ProxyAgent('http://localhost:8888')
                                    // try{
                                        // const requestAgent = new SocksProxyAgent({ hostname: 'localhost', port: '8888' });
                                        // const requestAgent = new SocksProxyAgent('a://localhost:8888');
                                    // }catch(e){
                                    //     console.log(e)
                                    //     throw new AssertError("Schema not match");
                                    // }
                                    // console.log(requestAgent);
                                    await new Promise((resolve, reject) => {
                                        newman.run({
                                            collection: JSON.parse(collectionJson),
                                            folder: iteration.CaseFolder,
                                            globals: {},
                                            environment: 'data/' + testSet + '/env.postman_environment.json',
                                            iterationData: [iteration],
                                            exportEnvironment: 'data/' + testSet + '/env.postman_environment.json',
                                            envVar: instanceEnv,
                                            // requestAgents: {
                                            //     https: requestAgent
                                            // },
                                            sslClientCertList: [{'name': 'gateway4', 'matches': global.config.certificate.host, 'key': {'src': global.config.certificate.key}, 'cert': {'src': global.config.certificate.cert}}],
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
                                            let step = "Step" + (args.cursor.position+1);
                                            let requestName = args.item.name;
                                            let fileName = testSet + '/' + caseName + "_" + step + "_" + requestName;
                                            let schemaCheck = '';
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
                                                if(global.config.log.response){
                                                    console.log("Response:");
                                                    console.log(JSON.stringify(response, null, 4));
                                                }
                                                let schema = toJsonSchema(response);
                                                if(global.config.log.schema){
                                                    console.log("Schema:");
                                                    console.log(JSON.stringify(toJsonSchema(JSON.parse(args.response.stream.toString())), null, 4));
                                                }
                                                fs.writeFile('./result/' + fileName + '_response.json', JSON.stringify(response, null, 4),()=>{});
                                                fs.writeFile('./result/' + fileName + '_schema.json', JSON.stringify(schema, null, 4),()=>{});
                                                if(global.config.schemaCheck){
                                                    let expectSchema = JSON.parse(fs.readFileSync('data/' + fileName + '_schema.json'));
                                                    schemaCheck = diffString(schema, expectSchema);
                                                    if(schemaCheck != ''){
                                                        console.log("Failed: " + caseName + " > " + step + ": " + requestName + "==>Schema not match");
                                                        console.log(schemaCheck);
                                                        throw new AssertError("Schema not match");
                                                    }
                                                }
                                            } catch(err){
                                                if(args.response !== undefined){
                                                    if(err.toString().search("no such file") < 0){
                                                        if(JSON.parse(xmljs.xml2json(args.response.stream.toString())).elements[0].elements[0].elements[0].name != 'ns2:transferDataResponse'){
                                                            console.log(err);
                                                        }
                                                        if(err.toString().search("AssertError") > 0){
                                                            console.log("Response: " + args.response.stream.toString());
                                                            fs.writeFile('./result/' + fileName + '_response.json', args.response.stream.toString(),()=>{});
                                                        } else {
                                                            if(JSON.parse(xmljs.xml2json(args.response.stream.toString())).elements[0].elements[0].elements[0].attributes['xmlns:ns2'] != "http://ws.xxx.xxx/") {
                                                                fs.writeFile('./result/' + fileName + '_response.json', args.response.stream.toString(),()=>{});
                                                                console.log("Response not JSON:\r\n" + xmlFormat(args.response.stream.toString()));
                                                                console.log("Schema: not JSON response")
                                                                assert.fail(step + ": " + requestName + "==>Schema not match\r\n" + schemaCheck); 
                                                            }
                                                            //soap response
                                                            let soapResponse = JSON.parse(xmljs.xml2json(args.response.stream.toString())).elements[0].elements[0].elements[0].elements[0].elements[0].text
                                                            let key = ''
                                                            let agentCode = JSON.parse(xmljs.xml2json(args.request.body.raw)).elements[0].elements[0].elements[0].elements[1].elements[0].text
                                                            for (var i = 0; i < 32; i++){
                                                                key += agentCode[i%agentCode.length]
                                                            }
                                                             let response = JSON.parse(CryptoJS.AES.decrypt(soapResponse, CryptoJS.enc.Utf8.parse(key), {iv: CryptoJS.enc.Utf8.parse(''), mode: CryptoJS.mode.CBC,   padding: CryptoJS.pad.Pkcs7}).toString(CryptoJS.enc.Utf8))
                                                            if(global.config.log.response){
                                                                console.log("Response:");
                                                                console.log(JSON.stringify(response, null, 4));
                                                            }
                                                            let schema = toJsonSchema(response);
                                                            if(global.config.log.schema){
                                                                console.log("Schema:");
                                                                console.log(JSON.stringify(toJsonSchema(JSON.parse(args.response.stream.toString())), null, 4));
                                                            }
                                                            fs.writeFile('./result/' + fileName + '_response.json', JSON.stringify(response, null, 4),()=>{});
                                                            fs.writeFile('./result/' + fileName + '_schema.json', JSON.stringify(schema, null, 4),()=>{});
                                                            if(global.config.schemaCheck){
                                                                let expectSchema = JSON.parse(fs.readFileSync('data/' + fileName + '_schema.json'));
                                                                schemaCheck = diffString(schema, expectSchema);
                                                                if(schemaCheck != ''){
                                                                    console.log("Failed: " + caseName + " > " + step + ": " + requestName + "==>Schema not match");
                                                                    console.log(schemaCheck);
                                                                    throw new AssertError("Schema not match");
                                                                }
                                                            }

                                                        }
                                                    } else {
                                                        assert.fail(step + ": " + requestName + "==>No Extected Schema File found");
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
                                                console.log(error);
                                            // console.log(Object.entries(errorMessage));
                                            // console.log(errorMessage);
                                            if(Object.entries(errorMessage) != 0){
                                                console.log(JSON.stringify(errorMessage, null, 4));
                                                assert.fail(JSON.stringify(errorMessage, null, 4));
                                            }
                                                                                     
                                            resolve(args);
                                        })
                                    });
                                    break;
                                default:
                                    console.log('Staging error>>>>>>>>');
                            }
                        }          
                
                    });
                } else {
                    console.log("!!!Case: " + iteration.iterationName + " is skip!!!");
                    it.skip(iteration.iterationName, async function(){});
                }
                
            })
        });
    } else {
        console.log("!!!Test Set: " + testSuite[j].scenario + " is skip!!!");
        describe.skip(testSuite[j].scenario, async function(){});
    }

}

