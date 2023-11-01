import '../../util/util.js';
import {Builder, Browser, By, Key, until, WebElement} from 'selenium-webdriver';

function AssertError(msg = "") {
    this.msg = msg;
    this.name = "AssertError";
}
AssertError.prototype = Error.prototype;

async function act(webStep, instanceEnv, iteration, runCount){
    let waitTime = webAction.selectWait(webStep);
    await webAction.driver.wait(
        until.elementLocated(
            webAction.locator(
                jsonQuery(
                    'data[page=' + webStep.page + ' & name=' + webStep.object + ']',
                    {data: webAction.pageObject}
                ).value
            )
        ),
        waitTime,
        'Timed out after ' + waitTime/1000 + 's'
    )
    .then(el => webAction.driver.executeScript("arguments[0].click();", el));
    let scrollEl = webAction.driver.findElement(
        webAction.locator(
            jsonQuery(
                'data[page=' + webStep.page + ' & name=' + webStep.object + ']',
                {data: webAction.pageObject}
            ).value
        )
    );
    // console.log('before')
    // await webAction.driver.executeScript("arguments[0].scrollIntoView(false);", scrollEl);
    // console.log('after')
    // await scrollEl.sendKeys(Key.END);
    await webAction.driver.executeScript("arguments[0].scrollTop = arguments[0].scrollHeight", scrollEl);
    // await webAction.driver.executeScript("arguments[0].scrollTop = 10", scrollEl);
    // await webAction.driver.executeScript("arguments[0].scrollTop = 20", scrollEl);
    // await webAction.driver.executeScript("arguments[0].scrollTop = 30", scrollEl);
    // await webAction.driver.executeScript("arguments[0].scrollTop = 40", scrollEl);
    // let findEl = webAction.driver.findElement(webAction.locator(jsonQuery('data[page=' + webStep.page + ' & name=' + webStep.object.split(";;")[1] + ']', {data: webAction.pageObject}).value));
    // console.log('then')
    // await webAction.driver.executeScript("arguments[0].scrollIntoView(false);", findEl);
    // await webAction.driver.executeScript("window.scroll(0,100);");
    // console.log('waiting')

    return instanceEnv;
}

export { act };