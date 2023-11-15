import csvtojson from 'csvtojson';
import * as fs from 'fs';
import jsonQuery from 'json-query';
import {enrich} from './stringEnrichment.js';
import _ from 'lodash';
import * as webAction from './webActions.js';

global.config = {};
try{
    console.log(process.env.npm_config_config);
    config = JSON.parse(fs.readFileSync(process.env.npm_config_config));
} catch(e) {
    config = JSON.parse(fs.readFileSync('./config/config.json'));
}
csvtojson().fromFile(config.suite).then();
global.testSuite = await csvtojson().fromFile(config.suite);
global.testNo = 0;
global.iteration = {};
global.fs = fs;
global.hasData = function(data){
    if(data != '' && data != null && data != undefined)
        return true;
    else
        return false;
}
global.csvtojson = csvtojson;
global.jsonQuery = jsonQuery;
global.enrich = enrich;
global._ = _;
global.webAction = webAction;

global.caseLog = "";

global.addCaseLog = function(newLog, level){
    switch (level){
        case "second":
            if(config.caseLog.second)
                caseLog += "\r\n" + newLog;
            break;
        case "third":
            if(config.caseLog.third)
                caseLog += "\r\n" + newLog;
            break;
        default:
            caseLog += "\r\n" + newLog;
    }
}

global.isActualSame = function(actual, expect){
    let len = 0;
    if(actual.length > expect.length)
        len = actual.length;
    else
        len = expect.length;

    for(let i = 0; i < len; i++)
        if(actual[i] != expect[i]){
            console.log("Diff at " + (i+1) + ": Actual(" + actual[i] + ") and Expected(" + expect[i] + ")");
            return false;
        }
    
    return true;
}

global.updateInstanceEnv = function(instanceEnv, envKey, envValue){
    let updatedInstanceEnv = instanceEnv.filter(e => e['key'] != envKey);
    updatedInstanceEnv.push({ type:'any', value:envValue, key:envKey });
    return updatedInstanceEnv;
}

global.clearCaseLog = function(){
    caseLog = "";
}