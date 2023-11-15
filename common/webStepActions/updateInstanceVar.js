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

    webStep.value.split(";;").forEach(arr => {
        let targetKey = arr.split('=')[0];
        let targetValue = arr.split('=')[1];
        instanceEnv = updateInstanceEnv(instanceEnv, targetKey , targetValue);

        // instanceEnv = instanceEnv.filter(el => el['key'] != targetKey && el['key'] != targetValue);
        // instanceEnv.push({ type:'any', value:targetValue, key:targetKey });
    });

    return instanceEnv;
}

export { act };