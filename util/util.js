import csvtojson from 'csvtojson';
import * as fs from 'fs';
import jsonQuery from 'json-query';
import {enrich} from './stringEnrichment.js';
import _ from 'lodash';
import * as webAction from './webActions.js';

global.config = {};
try{
    console.log(process.env.npm_config_config);
    global.config = JSON.parse(fs.readFileSync(process.env.npm_config_config));
} catch(e) {
    global.config = JSON.parse(fs.readFileSync('./config/config.json'));
}
csvtojson().fromFile(global.config.suite).then();
global.testSuite = await csvtojson().fromFile(global.config.suite);
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