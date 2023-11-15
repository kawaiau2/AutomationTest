import './util.js';
import * as webAct from '../util/webAct.js';
const callCollection = await import ('../util/callNewman.js');
import {getEnrichedInstanceEnv} from './stringEnrichment.js';

// var driver
var fileName = '';
var step = '';
var isSkipLoop = false;
var pageObject = {}
let env = {};
var link = '';
var loopCount = 0;
var totalLoop = 0;
var isSkipAll = false;

function AssertError(msg = "") {
    this.msg = msg;
    this.name = "AssertError";
}
AssertError.prototype = Error.prototype;

// var isDriverLive = false;
async function act(webStep, instanceEnv, iteration, testSuiteType, caseName, testSet) {
    // webStep = JSON.parse(enrich(JSON.stringify(webStep), instanceEnv));
    isSkipAll = false;
    var skipReason = "";
    let stepSkip = false;
    clearCaseLog();
    addCaseLog("Case: " + caseName);
    for(let x = 0; x<webStep.length; x++){
        // console.log(enrich(JSON.stringify(webStep[x]), instanceEnv))
        let step = await JSON.parse(enrich(JSON.stringify(webStep[x]), instanceEnv));
        instanceEnv = getEnrichedInstanceEnv();
        if(!isSkipAll){
            stepSkip = isStepSkip(step, instanceEnv);
            // console.log (stepSkip + ": " + webStep[x].runCondition + webStep[x].skipCondition);
            if(stepSkip){
                if(hasData(step.runCondition))
                    skipReason = "NOT '" + step.runCondition + "'";
                if(hasData(step.skipCondition))
                    skipReason = "'" + step.skipCondition + "'";
            }
        }
        // console.log("000 " + (x+1).toString().padStart(3,'0') + " 000 " + isSkipAll + " 000 " + webStep[x].stepName)
        if(step.action == 'loopStart'){
            if(stepSkip || isSkipAll){
                isSkipLoop = true;
                stepResult(caseName, x, step.stepName, skipReason, true);
            } else {
                totalLoop = step.value;
                if(!Number.isInteger(totalLoop))
                stepResult(caseName, x, step.stepName);
                instanceEnv = updateInstanceEnv(instanceEnv, 'loopStart', x+1);
                // instanceEnv = instanceEnv.filter(el => el['key'] != 'loopStart');
                // instanceEnv.push({ type:'any', value:x+1, key:'loopStart' });
            } 
        } else if(step.action == 'loopEnd') {
            if(isSkipLoop || isSkipAll)
                isSkipLoop = false;
            else {
                if(!Number.isInteger(totalLoop))
                    stepResult(caseName, x, step.stepName);

                instanceEnv = updateInstanceEnv(instanceEnv, 'loopEnd', x-1);
                // instanceEnv = instanceEnv.filter(el => el['key'] != 'loopEnd');
                // instanceEnv.push({ type:'any', value:x-1, key:'loopEnd' });
                loopCount++;
                instanceEnv = updateInstanceEnv(instanceEnv, 'loopStart', 'na');
                // instanceEnv = instanceEnv.filter(el => el['key'] != 'loopStart');
                // instanceEnv.push({ type:'any', value:'na', key:'loopStart' });
                let stepNo = 'Step' + (x+1).toString().padStart(3, '0');
                await webAct.setFileName(iteration, step.stepName, stepNo);
                await webAction.screenCap(true);
            }
        } else {
            if(!(isSkipLoop || stepSkip || isSkipAll)){
                if(testSuiteType == 'api' || step.action == 'api' || iteration.type == 'api'){
                    callCollection.setInstanceEnv(instanceEnv);
                    instanceEnv = await callCollection.req(iteration, testSet)
                } else {
                    stepResult(caseName, x, step.stepName);
                    instanceEnv = await webAct.act(step, instanceEnv, iteration, x+1);
                }
            } else 
                stepResult(caseName, x, step.stepName, skipReason, false);            
        }

        if(hasData(step.endCondition) && !isSkipAll){
            isSkipAll = skipLogic(step.endCondition.split(";;"), instanceEnv);
            if(isSkipAll){
                console.log("Case End Screen Capturing...")
                console.log("!!!!!Skill afterward steps by :" + step.endCondition)
                await webAction.screenCap(true);
                break;
            }
        }

        if(global.config.delay.debugWait > 0 )
            await webAction.driver.sleep(global.config.delay.debugWait);
    }

    if(testSuiteType != 'api' && webStep[webStep.length-1].action != 'api' && iteration.type != 'api')
        instanceEnv = await webAct.act({action: 'closeBrowser'}, instanceEnv)
    instanceEnv = instanceEnv.filter(el => el['key'] != 'loopStart');
    return instanceEnv;
}

function isStepSkip(webStep, instanceEnv){
    if(hasData(webStep.runCondition))
        return !skipLogic(webStep.runCondition.split(";;"), instanceEnv); 
        
    if(hasData(webStep.skipCondition))
        return skipLogic(webStep.skipCondition.split(";;"), instanceEnv);
    
    return false;
}

function skipLogic(condtions, instanceEnv){
    let logics = ['==', '!=', '<=', '>=', '>', '<'];
    let values = [];
    if( condtions != null && condtions != [] && condtions != undefined)
        for(let i = 0; i < condtions.length; i++)
            for(let j = 0; j < logics.length; j++)
                switch (logics[j]){
                    case '==':
                        if(condtions[i].search(logics[j]) >= 0){
                            values = condtions[i].split(logics[j]);
                            if (jsonQuery('data[key=' + values[0] + '].value', {data: {data: instanceEnv}}).value == values[1])
                                return true;
                        } 
                        break;
                    case '!=':
                        if(condtions[i].search(logics[j]) >= 0){
                            values = condtions[i].split(logics[j]);
                            // console.log('values: ' + values)
                            if (jsonQuery('data[key=' + values[0] + '].value', {data: {data: instanceEnv}}).value != values[1])
                                return true;
                        }
                        break;
                    case '>=':
                        if(condtions[i].search(logics[j]) >= 0){
                            values = condtions[i].split(logics[j]);
                            if (jsonQuery('data[key=' + values[0] + '].value', {data: {data: instanceEnv}}).value >= values[1])
                                return true;
                        }
                        break;
                    case '<=':
                        if(condtions[i].search(logics[j]) >= 0){
                            values = condtions[i].split(logics[j]);
                            if (jsonQuery('data[key=' + values[0] + '].value', {data: {data: instanceEnv}}).value <= values[1])
                                return true;
                        }
                        break;
                    case '<':
                        if(condtions[i].search(logics[j]) >= 0){
                            values = condtions[i].split('<');
                            if (jsonQuery('data[key=' + values[0] + '].value', {data: {data: instanceEnv}}).value < values[1])
                                return true;
                        }
                        break;
                    case '>':
                        if(condtions[i].search(logics[j]) >= 0){
                            values = condtions[i].split('>');
                            if (jsonQuery('data[key=' + values[0] + '].value', {data: {data: instanceEnv}}).value > values[1])
                                return true;
                        }
                        break;
                    default:
                        console.log(logics[j]);
                }
    return false;
}

function stepResult(caseName, stepNo, stepName, skipReason, isLoop){
    let step = "Step" + (stepNo+1).toString().padStart(3,'0') + ": " + stepName;
    if(hasData(skipReason)){
        if(isLoop){
            console.log("!!!!!SKIP LOOP by " + skipReason + ": " + caseName + " ==> " + step + "' SKIP LOOP!!!!!");
            addCaseLog("!!!SKIP LOOP by " + skipReason + "!!! " + step, "second");
        } else {
            console.log("!!!!!SKIP STEP by " + skipReason + ": " + caseName + " ==> " + step + "' SKIP STEP!!!!!");
            addCaseLog("!!!SKIP STEP by " + skipReason + "!!! " + step, "second");
        } 
    } else {
        console.log(caseName + " ==> " + step);
        addCaseLog(step);
    }
}

export { act };