import '../../util/util.js';
import * as selectDropDownTwoClick from './selectDropDownTwoClick.js';
import {Builder, Browser, By, Key, until, Select} from 'selenium-webdriver';

function AssertError(msg = "") {
    this.msg = msg;
    this.name = "AssertError";
}
AssertError.prototype = Error.prototype;

async function act(webStep, instanceEnv, iteration, runCount){
    // console.log(jsonQuery('data[page=' + webStep.page + ' & name=' + webStep.object + ']', {data: webAction.pageObject}).value)
    await selectDropDownTwoClick.act(noChildren(webStep, instanceEnv), instanceEnv, iteration, runCount);
    // console.log(jsonQuery('data[page=' + webStep.page + ' & name=ageOption].value1', {data: webAction.pageObject}).value.replace("{{i}}", ageRangeIdex(instanceEnv)))
    
    return instanceEnv;
}

function noChildren(webStep, instanceEnv){
    let max = 6;
    let children = jsonQuery('data[key=child].value', {data: {data: instanceEnv}}).value
    // console.log("Age: " + age);
    if (children > max){
        console.log("The number of children(" + children + ") is out range. The Range will be default 6");
        webStep.value = 6;
    }
    return webStep;
}
export { act };