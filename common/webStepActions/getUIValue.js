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
    let waitTime = webAction.selectWait(webStep);
    let querString = 'data[page=' + webStep.page + ' & name=' + webStep.object + ']';
    let pageObject = jsonQuery(querString,{data: webAction.pageObject}).value;
    await webAction.driver.wait(
        until.elementLocated(
            webAction.locator(pageObject)
        ),
        waitTime,
        'Timed out after ' + waitTime/1000 + 's'
    )
    .then(el => {
        return el.getText();
    })
    .then((textValue) => { 
        instanceEnv = updateInstanceEnv(instanceEnv, webStep.value, textValue);
})

    return instanceEnv;
}

export { act };