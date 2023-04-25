import csvtojson from 'csvtojson';
import * as fs from 'fs';
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