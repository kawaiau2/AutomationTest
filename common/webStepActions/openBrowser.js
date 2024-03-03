import '../../util/util.js';
import {Builder, Browser, By, Key, until} from 'selenium-webdriver';

function AssertError(msg = "") {
    this.msg = msg;
    this.name = "AssertError";
}
AssertError.prototype = Error.prototype;

async function act(webStep, instanceEnv, iteration, runCount){
    if(webAction.pageObject == null){
        console.log("Can't read page object")
    }
    let link = "";
    let querString = 'data[page=' + webStep.page + ' & name=' + webStep.object + '].value1';
    let pageObject = jsonQuery(
            querString,
            {data: webAction.pageObject}
        ).value;
    if(pageObject != null)
        link = enrich(pageObject, instanceEnv);
    else {
        throw new AssertError("No Link Found!!!(" + querString + ")");
    }
    try{
        await webAction.launchBrowser(instanceEnv);
    } catch (e){
        console.log(e)
    }

    await webAction.driver.get(link);
    return instanceEnv;
}

export { act };