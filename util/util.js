import csvtojson from 'csvtojson';
import * as fs from 'fs';
global.config = {};
if(process.env.npm_config_config !=null){
    global.config = JSON.parse(fs.readFileSync(process.env.npm_config_config));
    // console.log(process.env.npm_config_config);
} else {
    global.config = JSON.parse(fs.readFileSync('config.json'));
    // console.log(process.env);
}
csvtojson().fromFile(global.config.suite).then();
global.testSuite = await csvtojson().fromFile(global.config.suite);
global.testNo = 0;
global.iteration = {};