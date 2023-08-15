import '../../util/util.js';
import {Builder, Browser, By, Key, until} from 'selenium-webdriver';

function AssertError(msg = "") {
    this.msg = msg;
    this.name = "AssertError";
}
AssertError.prototype = Error.prototype;

async function act(webStep, instanceEnv, iteration, runCount){
    let waitTime = webAction.selectWait(webStep);
    // console.log(jsonQuery('data[page=' + webStep.page + ' & name=' + webStep.object + ']', {data: webAction.pageObject}).value)
    try{
        await webAction.driver.wait(
            until.elementLocated(
                By.xpath(
                    jsonQuery(
                        'data[page=' + webStep.page + ' & name=' + webStep.object + '].value1',
                        {data: webAction.pageObject})
                    .value
                )
            ),
            waitTime,
            'Timed out after ' + waitTime/1000 + 's'
        )
        .then(el => 
            webAction.driver.executeScript("arguments[0].setAttribute('style', 'right: " + webStep.value + "%;')", el)
        )
    } catch(e){
        console.log(e);
        throw e
    }
    
    return instanceEnv;
}

export { act };