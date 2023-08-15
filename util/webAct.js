import './util.js';
import {Builder, Browser, By, Key, until} from 'selenium-webdriver';

// var driver
var testSet ='';
var fileName = '';
var step = '';
var isSkip = false;
var pageObject = {}
let env = {};
var link = '';

function AssertError(msg = "") {
    this.msg = msg;
    this.name = "AssertError";
}
AssertError.prototype = Error.prototype;

// var isDriverLive = false;
async function act(webStep, instanceEnv, iteration, stepNo) {
    switch (webStep.action){
        case 'closeBrowser':
            try {
                await webAction.closeBrowser(true);
            }catch(e){
                console.log('Warning:');
                console.log(e);
            }
            break;
        default:
            try{
                step = 'Step' + stepNo.toString().padStart(3, '0');
                await setFileName(iteration, webStep.stepName, step);
                const webStepAction = await import ('../common/webStepActions/' + webStep.action + '.js');
                instanceEnv = await webStepAction.act(webStep, instanceEnv, iteration, stepNo);
                let loopStart = jsonQuery('data[key=loopStart].value', {data: {data:instanceEnv}}).value
                // console.log({data:instanceEnv})
                if( loopStart == 'na' || loopStart == null || loopStart == undefined)
                    await webAction.screenCap(true, step);
            } catch(e){
                console.log(e)
                await webAction.screenCap(false);
                webAction.closeBrowser();
                throw e
            }
    }
    

    return instanceEnv;
}

async function setWebObject(testSetName){
    testSet = testSetName
    await webAction.setWebObject(testSet);
}

async function setFileName(iteration, stepName, step){
    fileName = testSet + '/' + iteration.CaseId + "_" + iteration.iterationName + '_' + step + '_' + stepName.replace(/[/\\?%*:|"<>]/g, '');
    await webAction.setFileName(fileName);
}

export { act, setWebObject, setFileName };