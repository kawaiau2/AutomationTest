import '../../util/util.js';
import * as scriptClick from './scriptClick.js';
import {Builder, Browser, By, Key, until, Select} from 'selenium-webdriver';

function AssertError(msg = "") {
    this.msg = msg;
    this.name = "AssertError";
}
AssertError.prototype = Error.prototype;

async function act(webStep, instanceEnv, iteration, runCount){
    let waitTime = webAction.selectWait(webStep);
    // console.log(jsonQuery('data[page=' + webStep.page + ' & name=' + webStep.object + ']', {data: webAction.pageObject}).value)
    try{
        await scriptClick.act(webStep, instanceEnv, iteration, runCount);
        // console.log(jsonQuery('data[page=' + webStep.page + ' & name=ageOption].value1', {data: webAction.pageObject}).value.replace("{{i}}", ageRangeIdex(instanceEnv)))
        await webAction.driver.wait(
            until.elementLocated(
                By.xpath(
                    jsonQuery(
                        'data[page=' + webStep.page + ' & name=ageOption].value1',
                        {data: webAction.pageObject}
                    ).value
                .replace("{{i}}", ageRangeIdex(instanceEnv))
                )
            ),
            waitTime,
            'Timed out after ' + waitTime/1000 + 's'
        )
        .then(el => webAction.driver.executeScript("arguments[0].click();", el))
    } catch(e){
        console.log(e);
        throw e
    }
    
    return instanceEnv;
}

function ageRangeIdex(instanceEnv){
    let ranges = [25, 30, 35, 40, 45, 50, 55, 60, 65];
    let min = 18;
    let max = 64;
    let age = jsonQuery('data[key=age].value', {data: {data: instanceEnv}}).value
    // console.log("Age: " + age);
    if (age < min || age > max || age == null || age == undefined){
        console.log("The Age(" + age + ") is out range. The Range will be default 18-24");
        return 1;
    }
    for(let i = 0; i < ranges.length; i++)
        if(age < ranges[i])
            return i+1
}
export { act };