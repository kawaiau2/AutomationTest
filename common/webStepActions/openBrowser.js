import '../../util/util.js';
import {Builder, Browser, By, Key, until} from 'selenium-webdriver';

function AssertError(msg = "") {
    this.msg = msg;
    this.name = "AssertError";
}
AssertError.prototype = Error.prototype;

async function act(webStep, instanceEnv, iteration, runCount){
    let link = enrich(
        jsonQuery(
            'data[page=' + webStep.page + ' & name=' + webStep.object + '].value1',
            {data: webAction.pageObject}
        ).value,
        instanceEnv);
    await webAction.launchBrowser(instanceEnv);
    await webAction.driver.get(link);
    return instanceEnv;
}

export { act };