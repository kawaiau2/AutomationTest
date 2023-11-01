import '../util/util.js';

import * as webAct from '../util/webAct.js';
import * as stepLooping from '../util/stepLooping.js'

const callCollection = await import ('../util/callNewman.js');

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
        if(testSuite[j].type == 'web'){
            await webAct.setWebObject(testSet);
        }
        describe(testSet, () => {
            let stages = ['initEnv', 'preReq', 'step'];
            let runCount = 0;
            data.forEach(iteration => {
                if(iteration.skip != 'y' && iteration.skip != 'Y'){
                    it(iteration.CaseId + ": " + iteration.iterationName, async function() {
                        global.iteration = iteration;
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
                                            const preIteration = await import ('../common/' + iteration.preIteration + '.js');
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
                                            callCollection.setInstanceEnv(instanceEnv);
                                            instanceEnv = await callCollection.preReq(preRequests[k]);
                                        }
                                    }
                                    break;
                                case 'step':
                                    console.log(caseHeader + stages[i]+'>>>>>>');
                                    let webStep = [{}]
                                    if(iteration.type == 'web'){
                                        csvtojson().fromFile('data/' + testSet + '/' + iteration.CaseFolder + '.csv').then();
                                        webStep = await csvtojson().fromFile('data/' + testSet + '/' + iteration.CaseFolder + '.csv');
                                    }
                                    try{
                                        instanceEnv = await stepLooping.act(webStep, instanceEnv, iteration, testSuite[j].type, caseName, testSet);
                                    } catch(e) {
                                        console.log(e)
                                        throw e
                                    }
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

