import '../../util/util.js';
import {Builder, Browser, By, Key, until} from 'selenium-webdriver';
import {assert} from 'chai'; 

function AssertError(msg = "") {
    this.msg = msg;
    this.name = "AssertError";
}
AssertError.prototype = Error.prototype;

var pollingWait = global.config.delay.pollingWait;
var statusType = {
    active: "active",
    inactive: "unactive",
    completed: "completed",
    unactive: "unactive"
}
var stepName = {
    en: [
        "Tell us about yourself",
        "Discover the protection needs of people like you",
        "Calculate your protection needs",
        "Get your result"
    ],
    zhhk: [
        "基本個人資料",
        "查看與您類似人士的保障需要",
        "計算您的保障需要",
        "獲取測試結果"
    ],
    zhcn: [
        "基本个人资料",
        "查看与您类似人士的保障需要",
        "计算您的保障需要",
        "获取测试结果"
    ]
};
var stepNum = {
    en: [
        "STEP 1",
        "STEP 2",
        "STEP 3",
        "STEP 4"
    ],
    zhhk: [
        "第一步",
        "第二步",
        "第三步",
        "第四步"
    ],
    zhcn: [
        "第一步",
        "第二步",
        "第三步",
        "第四步"
    ]
};
var elementPaths = {
    desktop: "//div[contains(@class,'{{type}}')]/div/div[contains(@class,'{{status}}')]/parent::div/parent::div//p[contains(text(),'{{name}}')]",
    mobile: "//div[contains(@class,'{{type}}')]/div[contains(@class,'{{status}}')]/p[contains(text(),'{{name}}')]"
}

async function act(webStep, instanceEnv, iteration, runCount){
    let viewType = enrich("{{viewType}}", instanceEnv);
    let language = enrich("{{language}}", instanceEnv);
    let stepStatus = webStep.value.split(';;');

    for(var i = 0; i < stepStatus.length; i++){
        let isStepBullet =  webAction.driver.findElement(
            By.xpath(
                "//div[contains(@class, '" + statusType[stepStatus[i]] + "') and contains(text(), '" + (i+1) + "')]"
            )
        ).isDisplayed();
        
        assert.ok(isStepBullet, "!!!Failed: Step Menu '" + stepNum[language][i] + "' doesn't show");

        if((stepStatus[i] == "active") || (viewType == "desktop")){
            let isStepNumShow = await isElementLocated(webAction.driver, viewType, stepStatus[i], stepNum[language][i]);
            let isStepNameShow = await isElementLocated(webAction.driver, viewType, stepStatus[i], stepName[language][i]);

            assert.ok(isStepNumShow, "!!!Failed: Step Menu '" + stepNum[language][i] + "' doesn't show");
            assert.ok(isStepNameShow, "!!!Failed: Step Menu '" + stepNum[language][i] + "' doesn't show");
        }
        // console.log(stepNum[language][i] + " status is ok.");
    }

    return instanceEnv;
}

async function isElementLocated(driver, viewType, stepStatus, name){
    console.log(elementPaths[viewType]
        .replace("{{type}}", viewType)
            .replace("{{status}}", statusType[stepStatus])
                .replace("{{name}}", name))
    return await driver.findElement(
        By.xpath(
            elementPaths[viewType]
                .replace("{{type}}", viewType)
                    .replace("{{status}}", statusType[stepStatus])
                        .replace("{{name}}", name)
        )
    ).isDisplayed();
}



export { act };