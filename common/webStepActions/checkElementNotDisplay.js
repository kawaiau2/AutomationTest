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
        until.elementIsNotVisible(
            webAction.driver.findElement(
                webAction.locator(
                    jsonQuery(
                        'data[page=' + webStep.page + ' & name=' + webStep.object + ']',
                        {data: webAction.pageObject}
                    ).value
                )
            )
        ),
        waitTime,
        'Timed out after ' + waitTime/1000 + 's'
    )

    return instanceEnv;
}

export { act };