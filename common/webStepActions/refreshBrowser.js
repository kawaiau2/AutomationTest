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
    await webAction.driver.navigate().refresh();
    return instanceEnv;
}

export { act };