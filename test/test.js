import * as newman from 'newman';
import {assert} from 'chai'; 
import * as fs from 'fs';
import toJsonSchema from 'to-json-schema';
import csvtojson from 'csvtojson';
import {diffString} from 'json-diff';
import '../util/util.js';

function AssertError(msg = "") {
    this.msg = msg;
    this.name = "AssertError";
}
AssertError.prototype = Error.prototype;

let config = global.config;

let instanceEnv = [{}];
// if(process.env.npm_config_config !=null){
//     config = JSON.parse(fs.readFileSync(process.env.npm_config_config));
//     // console.log(process.env.npm_config_config);
// } else {
//     config = fs.readFileSync('config.json');
//     // console.log(process.env);
// }
// async function readCSV(path){
//     csvtojson().fromFile(path).then();
//     let csv = await csvtojson().fromFile(path);
//     console.log("csv:");
//     console.log(csv);
//     return csv;
// }
// console.log(config);
let testSuite = global.testSuite;
for(let j=0; j < testSuite.length; j++){
    // global.testNo = j;
// asynceachseries(testSuite, function(test, next){
    if(testSuite[j].skip !='y' && testSuite[j].skip !='Y'){
        let testSet =testSuite[j].scenario;
        // let data = readCSV('data/' + testSet + '/iterationfile.csv');
        // console.log(data);
        csvtojson().fromFile('data/' + testSet + '/iterationfile.csv').then();
        let data = await csvtojson().fromFile('data/' + testSet + '/iterationfile.csv');

        describe(testSet, () => {
            let collectionJson = fs.readFileSync('data/' + testSet + '/framework_trial.postman_collection.json');
            // let env = JSON.parse(fs.readFileSync('data/' + testSet + '/env.postman_environment.json')).values;
            // console.log(env);
            // console.log(data);
            let stages = ['initEnv', 'preReq', 'req'];
            data.forEach(iteration => {
                global.iteration = iteration;
            // asynceachseries(data, function(iteration, n){
                if(iteration.skip != 'y' && iteration.skip != 'Y'){
                    it(iteration.iterationName, async function() {
                        let errorMessage = {};
                        let caseName = iteration.iterationName;
                        let caseHeader = "Test case name: " + caseName + " ==> "
                        console.log(caseHeader + "start>>>>>");
                        for(let i=0;i<stages.length;i++){
                            console.log("stage:" + stages[i]);
                            switch(stages[i]){
                                case 'initEnv':
                                    console.log(caseHeader + stages[i]+'>>>>>>');
                                    console.log(iteration);
                                    if(iteration.preIteration != '' && iteration.preIteration != null){
                                        try{
                                            const preIteration = await import ('../common/' + iteration.preIteration);
                                            instanceEnv = preIteration.initEnv(iteration, testSet);
                                        } catch(e){
                                            console.log(e);
                                        }
                                        
                                        console.log("after initEnv");
                                        iteration = global.iteration;
                                        // console.log("after initEnv");
                                        console.log(instanceEnv);
                                        console.log(iteration.preRequest);
                                    }
                                    break;
                                case 'preReq':
                                    console.log(caseHeader + stages[i]+'>>>>>>');
                                    if(iteration.preRequest!= '' && iteration.preRequest!= null){
                                        let preRequests = iteration.preRequest.split(';');
                                        // console.log(preRequests);
                                        for (let k=0; k < preRequests.length; k++){
                                            await new Promise((resolve, reject) => {
                                                newman.run({
                                                    collection: JSON.parse(collectionJson),
                                                    folder: preRequests[k],
                                                    globals: {},
                                                    environment: 'preRequest/' + preRequests[k] + '/env.postman_environment.json',
                                                    envVar: instanceEnv
                                                })
                                                .on('start', (error,args)=> {
                                                // console.log("start:");
                                                // console.log(args);
                                                })
                                                .on('exception', (error,args)=> {
                                                    console.log("exception:");
                                                    console.log(args);
                                                })
                                                .on('done', (error,args)=> {
                                                    if(error != null)
                                                        console.log(error);
                                                    // console.log("login done");
                                                    resolve(args);
                                                });
                                            })
                                        }
                                    }
                                    break;
                                case 'req':
                                    console.log(caseHeader + stages[i]+'>>>>>>');
                                    const postIteration = await import ('../common/posttest.js');
                                    const postTesttc = await import('../common/posttestcase.js');
                                    console.log('data/' + testSet + '/env.postman_environment.json');
                                        console.log(iteration);
                                    await new Promise((resolve, reject) => {
                                        newman.run({
                                            collection: JSON.parse(collectionJson),
                                            folder: testSet,
                                            globals: {},
                                            environment: 'data/' + testSet + '/env.postman_environment.json',
                                            iterationData: [iteration],
                                            exportEnvironment: 'data/' + testSet + '/env.postman_environment.json',
                                            envVar: instanceEnv
                                        })
                                        .on('start', (error,args)=> {
                                            // console.log(args);
                                        })
                                        // .on('beforeIteration', (error,args)=> {
                                        //     console.log("\r\n>>>\r\n>>>\r\n==========Case" + (args.cursor.iteration+1) + ": " + data[args.cursor.iteration].iterationName + "========");
                                        // })
                                        // .on('prerequest', (error,args)=> {
                                        //     console.log("prerequest:");
                                        //     // console.log(preRequest.x(collectionJson, testSet, data));
                                        //     // console.log(args);
                                        // })
                                        .on('request', (error,args) => {
                                            
                                            let step = "Step" + (args.cursor.position+1);
                                            let requestName = args.item.name;
                                            let fileName = testSet + '/' + caseName + "_" + step + "_" + requestName;
                                            let schemaCheck = '';
                                            try{
                                                // console.log(args);
                                                // console.log("Test case name: " + caseName + " ==> " + step + ": " + requestName + " (code: " + args.response.code + ", time: " + args.response.responseTime + "ms, size: " + args.response.responseSize + ")");
                                                // console.log("Request Detail:");
                                                // console.log(JSON.stringify(args.request, null, 4));
                                                console.log("Response:");
                                                let response = JSON.parse(args.response.stream.toString());
                                                console.log(response);
                                                let schema = toJsonSchema(JSON.parse(args.response.stream.toString()));
                                                //console.log(JSON.stringify(toJsonSchema(JSON.parse(args.response.stream.toString())), null, 4));
                                                fs.writeFile('./result/' + fileName + '_response.json', JSON.stringify(response, null, 4),()=>{});
                                                fs.writeFile('./result/' + fileName + '_schema.json', JSON.stringify(schema, null, 4),()=>{});
                                                let expectSchema = JSON.parse(fs.readFileSync('data/' + fileName + '_schema.json'));
                                                schemaCheck = diffString(schema, expectSchema);
                                                if(schemaCheck != ''){
                                                    console.log("Failed: " + caseName + " > " + step + ": " + requestName + "==>Schema not match");
                                                    console.log(schemaCheck);
                                                    throw new AssertError("Schema not match");
                                                }
                                            } catch(err){
                                                console.log(err);
                                                if(err.toString().search("AssertError") > 0){
                                                    console.log("Response: " + args.response.stream.toString());
                                                    console.log("Schema: not JSON response")
                                                    fs.writeFile('./result/' + fileName + '_response.json', args.response.stream.toString(),()=>{});
                                                } else {
                                                    assert.fail(step + ": " + requestName + "==>Schema not match\r\n" + schemaCheck);
                                                }
                                            }
                                        })
                                        // .on('test', (error,args)=> {
                                        //     console.log("test");
                                        //     console.log(postTesttc.x("postTest"));
                                        //     // console.log(JSON.stringify(args,null,4));
                                        // })
                                        // .on('console', (error,args)=> {
                                        //     console.log("console");
                                        //     console.log(args.messages);
                                        //     // args.messages.forEach(message => {
                                        //     //     console.log(message.data);
                                        //     //     console.log(message.support);
                                        //     // });
                                        // })
                                        .on('exception', (error,args)=> {
                                            console.log("exception");
                                            // console.log(args);
                                            console.log(error);
                                            // onResolve(args);
                                        })
                                        .on('assertion', (error,args)=> {
                                            if(args.error != null){
                                                console.log("\r\n\r\n!!!!!EXCEPTION:");
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
                                            // console.log(postIteration.x("end"));
                                            // console.log(args);
                                            // console.log(JSON.stringify(args,null,4));
                                            // console.log("\r\nRequest timing summary:")
                                            // console.log(args.run.timings);
                                            // console.log(args.run.failures);
                                            // console.log(JSON.parse(fs.readFileSync('data/' + testSet + '/env.postman_environment.json')).values);
                                            if(errorMessage != {}){
                                                assert.fail(JSON.stringify(errorMessage, null, 4));
                                            }
                                            
                                            resolve(args);
                                            // n();
                                        })
                                        // .function((err, summary)=>{
                                        //     console.log(summary);
                                        //     resolve(summary);
                                        // });
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
                    // n();
                }
                
            })
        });
    } else {
        console.log("!!!Test Set: " + testSuite[j].scenario + " is skip!!!");
        describe.skip(testSuite[j].scenario, async function(){});
    }
    // next();
}
// ,function(err){
//     if(err != null){
//         console.log(err);
//     } else {
//         console.log("---------Testing Finished----------");
//     }
// })

