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
    .then(el =>{
        return el.getAttribute("innerText");
    })
    .then((innerText) => {
        let replacedSpan = innerText.replace(/\u00a0/g, '&nbsp');
        let regtext;
        if(hasData(webStep.value)){
            regtext = new RegExp(webStep.value);
            assert.ok(regtext.test(replacedSpan), "!!!Failed: Expected: '" + webStep.value + "', but Actual: '" + replacedSpan + "'.");
            // assert.ok(isActualSame(replacedSpan, webStep.value), "!!!Failed: Expected: '" + webStep.value + "', but Actual: '" + replacedSpan + "'.");
        } else {
            let expected = jsonQuery(
                'data[page=' + webStep.page + ' & name=' + webStep.object + '].value2',
                {data: webAction.pageObject}
            ).value;
            regtext = new RegExp(expected);
            assert.ok(regtext.test(replacedSpan), "!!!Failed: Expected: '" + expected + "', but Actual: '" + replacedSpan + "'.");
            // assert.ok(isActualSame(replacedSpan, expected), "!!!Failed: Expected: '" + expected + "', but Actual: '" + replacedSpan + "'.");
        }
    })

    return instanceEnv;
}

export { act };