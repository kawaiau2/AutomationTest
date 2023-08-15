import '../../util/util.js';
import * as scriptClick from './scriptClick.js';
import * as clickButton from './clickButton.js';
import {Builder, Browser, By, Key, until, Select} from 'selenium-webdriver';

function AssertError(msg = "") {
    this.msg = msg;
    this.name = "AssertError";
}
AssertError.prototype = Error.prototype;

async function act(webStep, instanceEnv, iteration, runCount){
    let waitTime = webAction.selectWait(webStep);
    // console.log(webStep.value)
    // console.log(stringEnrichment.enrich(webStep.value, instanceEnv))
    // console.log(jsonQuery('data[page=' + webStep.page + ' & name=' + webStep.object + ']', {data: webAction.pageObject}).value)
    try{
        await clickButton.act(webStep, instanceEnv, iteration, runCount);
        let listName = jsonQuery(
            'data[page=' + webStep.page + ' & name=' + webStep.object + '].value2',
            {data: webAction.pageObject}
            ).value;
        await webAction.driver.wait(
            until.elementLocated(
                By.xpath(
                    jsonQuery(
                        'data[page=' + webStep.page + ' & name=' + listName + '].value1',
                        {data: webAction.pageObject})
                    .value
                    .replace("{{i}}", enrich(webStep.value, instanceEnv))
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

export { act };