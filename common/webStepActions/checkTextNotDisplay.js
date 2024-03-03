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
    let searchedText = "";

    if(hasData(webStep.value))
        searchedText = enrich(webStep.value, instanceEnv);
    else
        searchedText = jsonQuery(
            'data[page=' + webStep.page + ' & name=' + webStep.object + '].value2',
            {data: webAction.pageObject}
            ).value.replace("&nbsp","").replaceAll("\\","");

    await webAction.driver.wait(
        until.elementIsNotVisible(
            webAction.driver.findElement(
                By.xpath(
                    "//*[contains(text(), '" + searchedText + "')]"
                )
            )
        ),
        waitTime,
        'Timed out after ' + waitTime/1000 + 's'
    )

    return instanceEnv;
}

export { act };