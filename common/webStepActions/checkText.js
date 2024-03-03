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
    let content = '';
    // console.log(webStep)
    if(hasData(webStep.object))
        content = jsonQuery(
            'data[page=' + webStep.page + ' & name=' + webStep.object + '].value1',
            {data: webAction.pageObject}
        ).value
    else
        content = enrich(webStep.value, instanceEnv);
    // console.log(content)
    await webAction.driver.wait(
        until.elementLocated(
            By.xpath('//*[contains(text(), "' + content + '")]')
        ),
        waitTime,
        'Timed out after ' + waitTime/1000 + 's'
    )

    return instanceEnv;
}

export { act };