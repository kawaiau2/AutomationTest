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
    // console.log(jsonQuery('data[page=' + webStep.page + ' & name=' + webStep.object + ']', {data: webAction.pageObject}).value)
    if(hasData(webStep.value.top))
        await webAction.driver.Window.scrollBy(webStep.value);
    else
        await webStep.driver.Window.scrollBy(webStep.value.x, webStep.value.y)

    await webAction.driver.sleep(global.config.delay.instantWait);

    return instanceEnv;
}

export { act };