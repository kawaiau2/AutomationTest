import '../../util/util.js';
import {Builder, Browser, By, Key, until} from 'selenium-webdriver';

function AssertError(msg = "") {
    this.msg = msg;
    this.name = "AssertError";
}
AssertError.prototype = Error.prototype;

var pollingWait = global.config.delay.pollingWait;
var languageList = {
    en: "en",
    zhhk: "繁",
    zhcn: "簡"
}

async function act(webStep, instanceEnv, iteration, runCount){
    let waitTime = webAction.selectWait(webStep);
    await webAction.driver.wait(
        until.elementLocated(
            By.xpath("//li[@class='cmp-languagenavigation__item']/a[contains(text(), '" + languageList[webStep.value] + "')]")
        ),
        waitTime,
        'Timed out after ' + waitTime/1000 + 's'
    )
    .then(el => webAction.driver.executeScript("arguments[0].click();", el));

    return instanceEnv;
}

export { act };