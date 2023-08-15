import '../../util/util.js';
import {diffString} from 'json-diff';
import {Builder, Browser, By, Key, until} from 'selenium-webdriver';
import { BrowserNetworkMonitor  } from 'selenium-query';

function AssertError(msg = "") {
    this.msg = msg;
    this.name = "AssertError";
}
AssertError.prototype = Error.prototype;

var pollingWait = global.config.delay.pollingWait;
var instanceEnvironment;

async function act(webStep, instanceEnv, iteration, runCount){
  let waitTime = webAction.selectWait(webStep);
  let monitor = await BrowserNetworkMonitor.start(webAction.driver);
  let request = {};
  let response = {};
  let responseBody = {};
  let actualCode;
  let codeError = false;
  let expectReq = jsonQuery(
      'data[page=' + webStep.page + ' & name=' + webStep.object + '].value2',
      {data: webAction.pageObject}
    ).value;
  let expectEndPoint = expectReq.split(';;')[0];
  // console.log(expectEndPoint)
  let expectMethod = expectReq.split(';;')[1];
  let expectRequestBody = webStep.value.split(';;')[0];
  let expectCode = webStep.value.split(';;')[1];
  let expectResponseBody =  webStep.value.split(';;')[2];
  let valuesToVerify = webStep.value.split(';;')[3];
  instanceEnvironment = instanceEnv

  monitor
  .on('requestWillBeSent', req => {
    if(req.request.url == expectEndPoint && req.request.method == expectMethod)
      request = req;
    // console.log(req.request.url)
    // console.log(expectEndPoint)
    // console.log(req.request.method)
    // console.log(expectMethod)
    // console.log(request)
    })
  .on('responseReceived', res => {
    if(res.request.url == expectEndPoint && res.request.method == expectMethod){
      response = res;
      // console.log('expect code:' + expectCode)
      // console.log(res.response.status)
      if(expectCode != '' && expectCode != null && expectCode != undefined)
        if(expectCode != res.response.status){
          actualCode = res.response.status;
          codeError = true;
        }
        else
          console.log("Status Code is verified passed as " + res.response.status)
    }
  })
  // .on('loadingFinished', req => console.log(req));
  const webStepAction = await import ('./' + webStep.extraAction + '.js');
  instanceEnvironment = await webStepAction.act(webStep, instanceEnvironment, iteration, runCount);
  for (let i=0; i < 40; i++)
    try{
      responseBody = await monitor.getResponseBody(response);
      if(hasData(responseBody.body))
        i = 40;

    }catch(e){
      // console.log(e)
      // console.log(responseBody)
      console.log("Waiting the response....for " + (i*pollingWait/1000 +1) + "s");
      await webAction.driver.sleep(pollingWait);
    }
  if(request.request.url == null)
    throw new AssertError(expectEndPoint + ", Method: " + expectMethod + " Not Found!!!");
  let requestBody = await monitor.getRequestBody(request);

  // console.log(JSON.stringify(JSON.parse(requestBody.body),null,4))
  // console.log(responseBody)
  let actualRequestBody = JSON.parse(requestBody.body);

  checkSchema(actualRequestBody, expectRequestBody, 'Request');
  if(codeError)
    throw new AssertError("Response Code not matched (expected:" + expectCode + " ,Actual:" + actualCode);

  let actualResponseBody = JSON.parse(responseBody.body);
  checkSchema(actualResponseBody, expectResponseBody, 'Response');

  verifyValue(valuesToVerify, actualRequestBody, actualResponseBody);

  return instanceEnvironment;
    
}

function checkSchema(actualBody, expectBody, type){
  let isJSON = false;
  try{
    if(JSON.stringify(expectBody)!='{}' && JSON.stringify(expectBody)!= '""' && expectBody != undefined && expectBody != null && expectBody != '' && expectBody != '{}'){
      // console.log(JSON.stringify(expectBody))
      // console.log(expectBody)
      isJSON = true;
    }
      
  } catch(e) {}
  if (isJSON){
    let schemaCheck = diffString(toJsonSchema(actualBody), toJsonSchema(JSON.parse(expectBody)));
    if(schemaCheck != ''){
      console.log(schemaCheck);
      throw new AssertError("Schema not match");
    }
    console.log(type + " Schema Check Passed");
  }
}

function verifyValue(valuesToVerify, actualRequestBody, actualResponseBody){
  if (valuesToVerify != '' && valuesToVerify != null && valuesToVerify != undefined){
    JSON.parse(enrich(valuesToVerify, instanceEnvironment)).forEach(el => {
      
      switch (el.type){
        case 'request':
          let actualRequestValue = jsonQuery(el.path, {data: actualRequestBody}).value;
          if( actualRequestValue!= el.value)
            throw new AssertError(el.path + " is not matched. Expect:" + el.value + ", Actual:" + actualRequestValue);
          break;
        case 'response':
          let actualResponseValue = jsonQuery(el.path, {data: actualResponseBody}).value;
          if( actualResponseValue!= el.value)
            throw new AssertError(el.path + " is not matched. Expect:" + el.value + ", Actual:" + actualResponseValue);
          break;
        default:
          console.log(el.path + " is skip for verify")
      }
    });
  }
}

export { act };