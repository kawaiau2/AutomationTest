import '../../util/util.js';
import {assert} from 'chai'; 
import {Builder, Browser, By, Key, until} from 'selenium-webdriver';

function AssertError(msg = "") {
    this.msg = msg;
    this.name = "AssertError";
}
AssertError.prototype = Error.prototype;

var pollingWait = global.config.delay.pollingWait;
var pageLoad = global.config.delay.pageLoad;

async function act(webStep, instanceEnv, iteration, runCount){
    let expectLink = '';
    if (webStep.value == null || webStep.value == '')
        expectLink = jsonQuery(
            'data[page=' + webStep.page + ' & name=' + webStep.object + '].value1',
            {data: webAction.pageObject}
        ).value
    else
        expectLink = webStep.value;
    expectLink = enrich(expectLink, instanceEnv);
    let actualLink = ''
    for(let i = 0; i < 20; i++){
        actualLink = await webAction.driver.getCurrentUrl();
        if(actualLink!=expectLink){
            console.log('Waiting.....' + i + '.....Current:' + actualLink);
            await webAction.sleep(pollingWait);
        }
    }
    assert.equal(actualLink, expectLink, "Redirect to wrong address");
    return instanceEnv;
}

export { act };