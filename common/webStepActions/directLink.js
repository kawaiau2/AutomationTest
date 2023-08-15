import '../../util/util.js';
import {Builder, Browser, By, Key, until} from 'selenium-webdriver';

function AssertError(msg = "") {
    this.msg = msg;
    this.name = "AssertError";
}
AssertError.prototype = Error.prototype;

var pollingWait = global.config.delay.pollingWait;
var pageLoad = global.config.delay.pageLoad;

async function act(webStep, instanceEnv, iteration, runCount){
    let link = '';
    if (webStep.value == null || webStep.value == '')
        link = jsonQuery(
                'data[page=' + webStep.page + ' & name=' + webStep.object + '].value1',
                {data: webAction.pageObject}
            ).value
    else
        link = webStep.value;
    try{
        link = enrich(link, instanceEnv);
        await webAction.driver.get(link);
    } catch(e){
        try{
            if (e.toString().search("NoSuchSessionError") < 0){
                throw e  
            } else {
                await webAction.launchBrowser(instanceEnv);
                await webAction.driver.get(link);     
            }
        } catch(er){
            throw er;
        }
    }
    return instanceEnv;
}

export { act };