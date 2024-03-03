import '../../util/util.js';
import {assert} from 'chai'; 
import {Builder, Browser, By, Key, until} from 'selenium-webdriver';
import { enrich } from '../../util/stringEnrichment.js';

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
    pageObject.value1 = enrich(pageObject.value1, instanceEnv);
    let foundElement = await webAction.driver.findElements(
                webAction.locator(pageObject)
            );
    assert.equal(foundElement.length, 0, "!!!Failed: " + pageObject + " is exist");
    return instanceEnv;
}

export { act };