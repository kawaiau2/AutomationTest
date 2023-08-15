import '../../util/util.js';
import {Builder, Browser, By, Key, until} from 'selenium-webdriver';

function AssertError(msg = "") {
    this.msg = msg;
    this.name = "AssertError";
}
AssertError.prototype = Error.prototype;

async function act(webStep, instanceEnv, iteration, runCount){
    let waitTime = webAction.selectWait(webStep);
    try{
        // console.log("//*[contains(text(), '*" + webStep.value + "*')]")
        await webAction.driver.wait(
            until.elementLocated(
                By.xpath("//*[contains(text(), '" + webStep.value + "')]")
            ),
            waitTime,
            'Timed out after ' + waitTime/1000 + 's'
        ).then(el => webAction.driver.executeScript("arguments[0].click();", el))
        await webAction.driver.sleep(1500)
    } catch(e){
        console.log(e)
        throw e
    }
    
    return instanceEnv;
}

export { act };