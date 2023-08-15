import '../../util/util.js';
import {Builder, Browser, By, Key, until, Select} from 'selenium-webdriver';

function AssertError(msg = "") {
    this.msg = msg;
    this.name = "AssertError";
}
AssertError.prototype = Error.prototype;

async function act(webStep, instanceEnv, iteration, runCount){
    let waitTime = webAction.selectWait(webStep);
    // console.log(jsonQuery('data[page=' + webStep.page + ' & name=' + webStep.object + '].value1', {data: webAction.pageObject}).value
    // .replace("{{i}}", mapAttitudeId (webStep, instanceEnv)))
    try{
        await webAction.driver.wait(
            until.elementLocated(
                By.id(
                    jsonQuery(
                        'data[page=' + webStep.page + ' & name=' + webStep.object + '].value1',
                        {data: webAction.pageObject}
                    ).value
                    .replace("{{i}}", mapAttitudeId (webStep, instanceEnv))
                )
            ),
            waitTime,
            'Timed out after ' + waitTime/1000 + 's'
        )
            .then(el => webAction.driver.executeScript("arguments[0].click();", el));
    } catch(e){
        console.log(e);
        throw e
    }
    return instanceEnv;
}

function mapAttitudeId (webStep, instanceEnv){
    let attitudes = ['Strongly disagree', 'Somewhat disagree', 'Netural', 'Somewhat agree', 'Strongly agree'];
    return attitudes.indexOf(enrich(webStep.value, instanceEnv)) + 1;

}

export { act };