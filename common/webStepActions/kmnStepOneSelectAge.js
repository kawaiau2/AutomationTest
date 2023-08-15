import '../../util/util.js';
import * as selectDropDownTwoClick from './selectDropDownTwoClick.js';
import {Builder, Browser, By, Key, until, Select} from 'selenium-webdriver';

function AssertError(msg = "") {
    this.msg = msg;
    this.name = "AssertError";
}
AssertError.prototype = Error.prototype;

var pollingWait = global.config.delay.pollingWait;
var pageLoad = global.config.delay.pageLoad;

async function act(webStep, instanceEnv, iteration, runCount){
    // console.log(jsonQuery('data[page=' + webStep.page + ' & name=' + webStep.object + ']', {data: webAction.pageObject}).value)
    try{
        await selectDropDownTwoClick.act(ageInRange(webStep, instanceEnv), instanceEnv, iteration, runCount);
        // console.log(jsonQuery('data[page=' + webStep.page + ' & name=ageOption].value1', {data: webAction.pageObject}).value.replace("{{i}}", ageRangeIdex(instanceEnv)))
    } catch(e){
        console.log(e);
        throw e
    }
    
    return instanceEnv;
}

function ageInRange(webStep, instanceEnv){
    let min = 18;
    let max = 80;
    let age = jsonQuery('data[key=age].value', {data: {data: instanceEnv}}).value
    // console.log("Age: " + age);
    if (age < min){
        console.log("The Age(" + age + ") is out range. The Range will be default 18");
        webStep.value = 18;
    } else
        if(age > max){
            console.log("The Age(" + age + ") is out range. The Range will be default 80");
            webStep.value = 80;
        }
    return webStep;
}
export { act };