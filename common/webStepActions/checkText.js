import '../../util/util.js';
import {Builder, Browser, By, Key, until} from 'selenium-webdriver';

function AssertError(msg = "") {
    this.msg = msg;
    this.name = "AssertError";
}
AssertError.prototype = Error.prototype;

var pollingWait = global.config.delay.pollingWait;

async function act(webStep, instanceEnv, iteration, runCount){
    let waitTime = webAction.selectWait(webStep);
    await webAction.driver.wait(
        until.elementLocated(
            By.xpath("//*[contains(text(), '" + enrich(webStep.value, instanceEnv) + "')]")
        ),
        waitTime,
        'Timed out after ' + waitTime/1000 + 's'
    )
    return instanceEnv;
}

export { act };