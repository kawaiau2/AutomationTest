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

let testSuites = global.testSuites;

for await (const testSuite of testSuites){
    // console.log(testSuite)
    if(testSuite.skip !='y' && testSuite.skip !='Y'){
        let testSet = testSuite.scenario;
        if(hasData(testSuite.testPlan)){
            testPlanId = testSuite.testPlan;
        }
        if(hasData(testSuite.testExec)){
            testExecutionId = testSuite.testExec;
        }
        if(hasData(testPlanId))
            testSetPrefix = "_" + testPlanId;
        try{
            fs.unlinkSync("result" + "/" + testSet + testSetPrefix + "/" + "console.log");
        } catch (e){

        }
        csvtojson().fromFile('data/' + testSet + '/iterationfile.csv').then();
        let data = await csvtojson().fromFile('data/' + testSet + '/iterationfile.csv');
        if(testSuite.type == 'web'){
            await webAct.setWebObject(testSet, testPlanId, testExecutionId);
        }
        
        if (!fs.existsSync('./result/' + testSet + testSetPrefix)){
            fs.mkdirSync('./result/' + testSet + testSetPrefix);
        }

        describe(testSet, () => {
            let stages = ['initEnv', 'preReq', 'step'];
            let runCount = 0;
            data.forEach(async iteration => {
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
                                    instanceEnv = await stepLooping.act(webStep, instanceEnv, iteration, testSuite.type, caseName, testSet);
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
        console.log("!!!Test Set: " + testSuite.scenario + " is skip!!!");
        describe.skip(testSuite.scenario, async function(){});
    }

}

