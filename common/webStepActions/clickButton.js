import '../../util/util.js';
import {Builder, Browser, By, Key, until} from 'selenium-webdriver';

function AssertError(msg = "") {
    this.msg = msg;
    this.name = "AssertError";
}
AssertError.prototype = Error.prototype;

var pollingWait = global.config.delay.pollingWait;
var pageLoad = global.config.delay.pageLoad;

async function act(webStep, instanceEnv, iteration, runCount){
    let waitTime = webAction.selectWait(webStep);
    let querString = 'data[page=' + webStep.page + ' & name=' + webStep.object + ']';
    let pageObject = jsonQuery(querString,{data: webAction.pageObject}).value;
    // console.log(jsonQuery('data[page=' + webStep.page + ' & name=' + webStep.object + ']', {data: webAction.pageObject}).value)
    await webAction.driver.wait(
        until.elementLocated(
            webAction.locator(pageObject)
        ),
        waitTime,
        'Timed out after ' + waitTime/1000 + 's'
    )
    .then(el => el.click())
    // .then(el => el.sendKeys(Key.ENTER))
    // .then(el => webAction.driver.executeScript("arguments[0].click();", el))
    return instanceEnv;
}

export { act };