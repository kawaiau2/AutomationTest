import './util.js';
import * as path from 'path';
import {Builder, Browser, By, Key, until} from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome.js';
import * as edge from 'selenium-webdriver/edge.js';

var driver
var testSet ='';
var pageObject = {}
let env = {};
var link = '';
var TIMEOUT = 100000;
var fileName = '';
var currentDriverCaseId = '';

function AssertError(msg = "") {
    this.msg = msg;
    this.name = "AssertError";
}
AssertError.prototype = Error.prototype;

// var isDriverLive = false;

async function setWebObject(testSetName) {
    csvtojson().fromFile('data/' + testSetName + '/pageObject.csv').then();
    let arr = await csvtojson().fromFile('data/' + testSetName + '/pageObject.csv');
    pageObject = {data: arr};
    // console.log(arr)
    testSet = testSetName;
}

async function setFileName(fileNameText) {
    // console.log(fileNameText)
    fileName = fileNameText;
}


async function closeBrowser(caseId, forceQuit){
    if(caseId == currentDriverCaseId && (global.config.closeBrowserIfFailure || forceQuit)){
        await driver.quit();
        // addCaseLog(JSON.stringify(driver, null,4))
        driver = null;
    }
}

async function launchBrowser(instanceEnv){
    let resolution = jsonQuery('data[key=screenResolution].value', {data: {data:instanceEnv}}).value;
    let browser = jsonQuery('data[key=browser].value', {data: {data:instanceEnv}}).value;
    let fullScr = false;
    
    if(!hasData(resolution)){
        resolution = "1600,1200";
        fullScr = true;
    }
       
    if(!hasData(browser)&&!global.config.browser.overRider)
        browser = global.config.browser.browser;
    else 
        global.config.browser = browser;

    switch(browser){
        case 'Chrome':
            const chromeService = new chrome.ServiceBuilder(path.resolve('external/chromedriver'))
            const chromeOption = new chrome.Options();
            chromeOption.addArguments("--window-size=" + resolution);
            if(global.config.headless.on){
                if(global.config.headless.new)
                    chromeOption.addArguments("--headless=new");
                else
                    chromeOption.addArguments("--headless=old");
            }
            driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(chromeOption)
            .setChromeService(chromeService)
            .build();
            break;
        case 'Edge':
            const edgeService = new edge.ServiceBuilder(path.resolve('external/msedgedriver'))
            const edgeOption = new edge.Options();
            edgeOption.addArguments("--window-size=" + resolution);
            if(global.config.headless.on){
                if(global.config.headless.new)
                    edgeOption.addArguments("--headless=new");
                else
                    edgeOption.addArguments("--headless=old");
            }
            driver = await new Builder()
            .forBrowser(Browser.EDGE)
            .setEdgeService(edgeService)
            .setEdgeOptions(edgeOption)
            .build();
            break;
        default:
            throw new AssertError(browser + " is not supported");
    }
    // console.log(driver)
    currentDriverCaseId = jsonQuery('data[key=CaseId].value', {data: {data:instanceEnv}}).value;
    if(fullScr)
        await driver.manage().window().maximize();
}

async function screenCap(isStepCap){
    if(global.config.screenCap){
        if(isStepCap){
            await driver.manage().setTimeouts( { implicit: TIMEOUT, pageLoad: TIMEOUT, script: TIMEOUT } )
        }
        if(!isStepCap || global.config.allStepScreenCap){
            if(driver != null){
                let result = (isStepCap) ? 'pass':'fail';
                console.log('./result/' + fileName + '_' + result + '.png')
                console.log('Capturing screen...')
                await sleep(100);
                await driver.takeScreenshot().then(
                    function(image, err) {
                        fs.writeFile('./result/' + fileName + '_' + result + '.png', image, 'base64', function(err) {
                            if(err != null)
                                console.log(err);
                        });
                        if(err != undefined)
                            throw err
                    }
                );
            } else {
                console.log("!!!Warning: Failed to screen cature due to driver is null!!!");
                addCaseLog("!!!Warning: Failed to screen cature due to driver is null!!!");
            }
        }
    }
}

function locator(element) {
    //console.log(element);
    switch (element.type) {
        case 'xpath':
            // console.log(By.xpath(element.value1))
            return By.xpath(element.value1);
        case 'class':
            // console.log(By.className(element.value1))
            return By.className(element.value1);
        case 'id':
            // console.log(By.id(element.value1))
            return By.id(element.value1);
        case 'name':
            // console.log(By.id(element.value1))
            return By.name(element.value1);
        default:
            return null
    }
}

function selectWait(webStep){
    if(webStep.pageLoad == 'y' || webStep.pageLoad == 'y')
        return global.config.delay.pageLoad;
    else
        return global.config.delay.instantWait;
}

async function sleep(mSec){
    if(driver != null)
        driver.sleep(mSec);
    else
        await new Promise(r => setTimeout(r, mSec));
}


export { 
    driver,
    pageObject,
    setWebObject,
    setFileName,
    locator,
    closeBrowser,
    launchBrowser,
    screenCap,
    selectWait,
    sleep
};