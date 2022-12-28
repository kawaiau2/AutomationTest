import * as newman from 'newman';
import * as fs from 'fs';
async function x(collectionJson, testSet, data) {
    new Promise(function(onResolve) {
        newman.run({
            collection: JSON.parse(collectionJson),
            folder: testSet,
            globals: {},
            environment: fs.readFileSync('data/' + testSet + '/env.postman_environment.json'),
            iterationData: data
        })
        .on('done', (error,args)=> {
            console.log(error);
            console.log("login done");
            return "login success";
        });
    })
    
}
export { x };