import '../../util/util.js';
import * as scriptClick from './scriptClick.js';
import * as verifyPayload from './verifyPayload.js';
import {Builder, Browser, By, Key, until, Select} from 'selenium-webdriver';

function AssertError(msg = "") {
    this.msg = msg;
    this.name = "AssertError";
}
AssertError.prototype = Error.prototype;

async function act(webStep, instanceEnv, iteration, runCount){
    // let waitTime = webAction.selectWait(webStep);
    // console.log(jsonQuery('data[page=' + webStep.page + ' & name=' + webStep.object + '].value1', {data: webAction.pageObject}).value
    // .replace("{{i}}", mapAttitudeId (webStep, instanceEnv)))

    let dataToBeVerified = {data: JSON.parse(webStep.value.split(';;')[3])};
    // console.log(dataToBeVerified)
    let coverage = jsonQuery(
        "data[path=protections[0].currentCoverage].value",
        {data: dataToBeVerified}
    ).value
    // console.log(JSON.stringify(coverage,null,4))
    if(coverage == '0' || coverage == "No Coverage" || coverage == "没有" || coverage == "沒有")
        await scriptClick.act(webStep, instanceEnv, iteration, runCount);
    else
    {
        switch(coverage){
            case '普通房':
                webStep.value =  webStep.value.replace("普通房", 'W');
                break;
            case 'Ward':
                webStep.value =  webStep.value.replace("Ward", 'W');
                break;
            case '半私家房':
                webStep.value =  webStep.value.replace("半私家房", 'S');
                break;
            case 'Semi-Private':
                webStep.value =  webStep.value.replace("Semi-Private", 'S');
                break;
            case '标准私家房':
                webStep.value =  webStep.value.replace("标准私家房", 'P');
                break;
            case '標準私家房':
                webStep.value =  webStep.value.replace("標準私家房", 'P');
                break;
            case 'Standard Private':
                webStep.value =  webStep.value.replace("Standard Private", 'P');
                break;
            default:

        }
        // console.log(webStep.value);
        await verifyPayload.act(webStep, instanceEnv, iteration, runCount);
    }

    return instanceEnv;
}

export { act };