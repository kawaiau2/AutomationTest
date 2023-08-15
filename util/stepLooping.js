import './util.js';
import * as webAct from '../util/webAct.js';
const callCollection = await import ('../util/callNewman.js');

// var driver
var testSet ='';
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
async function act(webStep, instanceEnv, iteration, testSuiteType, caseName) {
    webStep = JSON.parse(enrich(JSON.stringify(webStep), instanceEnv));
    isSkipAll = false;
    for(let x = 0; x<webStep.length; x++){
        let stepSkip = isStepSkip(webStep[x], instanceEnv);
        if(webStep[x].action == 'loopStart'){
            if(stepSkip || isSkipAll){
                isSkipLoop = true;
                console.log("!!!!!SKIP LOOP '" + caseName + " ==> Step" + (x+1).toString().padStart(3,'0') + ": " + webStep[x].stepName + "' SKIP LOOP!!!!!");
            } else {
                totalLoop = webStep[x].value;
                if(!Number.isInteger(totalLoop))
                    console.log(caseName + " ==> Step" + (x+1).toString().padStart(3,'0') + ": " + webStep[x].stepName);
                instanceEnv = instanceEnv.filter(el => el['key'] != 'loopStart');
                instanceEnv.push({ type:'any', value:x+1, key:'loopStart' });
            } 
        } else if(webStep[x].action == 'loopEnd') {
            if(isSkipLoop || isSkipAll)
                isSkipLoop = false;
            else {
                if(!Number.isInteger(totalLoop))
                    console.log(caseName + " ==> Step" + (x+1).toString().padStart(3,'0') + ": " + webStep[x].stepName);
                instanceEnv = instanceEnv.filter(el => el['key'] != 'loopEnd');
                instanceEnv.push({ type:'any', value:x-1, key:'loopEnd' });
                loopCount++;
                instanceEnv = instanceEnv.filter(el => el['key'] != 'loopStart');
                instanceEnv.push({ type:'any', value:'na', key:'loopStart' });
                let step = 'Step' + (x+1).toString().padStart(3, '0');
                await webAct.setFileName(iteration, webStep[x].stepName, step);
                await webAction.screenCap(true, step);
            }
        } else {
            if(!(isSkipLoop || stepSkip || isSkipAll)){
                if(testSuiteType == 'api' || webStep[x].action == 'api' || iteration.type == 'api'){
                    callCollection.setInstanceEnv(instanceEnv);
                    instanceEnv = await callCollection.req(iteration, testSet)
                } else {
                    console.log(caseName + " ==> Step" + (x+1).toString().padStart(3,'0') + ": " + webStep[x].stepName);
                    await webAct.act(webStep[x], instanceEnv, iteration, x+1);
                }
            } else 
                console.log("!!!!!SKIP STEP '" + caseName + " ==> Step" + (x+1).toString().padStart(3,'0') + ": " + webStep[x].stepName + "' SKIP STEP!!!!!");
        }

        if(hasData(webStep[x].endCondition))
            isSkipAll = skipLogic(webStep[x].endCondition.split(";;"), instanceEnv);
            
    }
    await webAct.act({action: 'closeBrowser'}, instanceEnv)
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
                            console.log('values: ' + values)
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

export { act };