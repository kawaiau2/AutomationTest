import '../../util/util.js';
import {Builder, Browser, By, Key, until} from 'selenium-webdriver';
import {assert} from 'chai'; 

function AssertError(msg = "") {
    this.msg = msg;
    this.name = "AssertError";
}
AssertError.prototype = Error.prototype;

var pollingWait = global.config.delay.pollingWait;

async function act(webStep, instanceEnv, iteration, runCount){
    let locator;
    let altView = enrich("{{" + webStep.value + "}}", instanceEnv);
    
    if(hasData(altView))
        locator = jsonQuery(
            'data[page=' + webStep.page + ' & name=' + webStep.object + altView + ']',
            {data: webAction.pageObject}
        ).value;
    else
        locator = jsonQuery(
            'data[page=' + webStep.page + ' & name=' + webStep.object + ']',
            {data: webAction.pageObject}
        ).value;
    let waitTime = webAction.selectWait(webStep);
    await webAction.driver.wait(
        until.elementIsVisible(
            webAction.driver.findElement(
                webAction.locator(locator)
        )),
        waitTime,
        'Timed out after ' + waitTime/1000 + 's'
    )
    
    return instanceEnv;
}

export { act };