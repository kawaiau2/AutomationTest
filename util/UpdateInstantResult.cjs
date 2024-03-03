require('util'); 
const fs = require('fs');
const newman = require('newman');

function updateResult(testPlanId, testExecutionId, caseId, testSuite, testStatus, failureDetail) {
    var tests = [];
    var evidences = [];
    var stages = ['initResult', 'updateResult', 'returnResult'];
    var result;
    if(hasData(caseId))
        for(var i=0;i<stages.length;i++){
            switch(stages[i]){
                case 'initResult':
                    try{
                        fs.readdirSync("./result/" + testSuite + testSetPrefix).forEach((file)=>{
                            if(file.indexOf(caseId) == 0)
                                evidences.push({
                                    "data": fs.readFileSync("./result/" + testSuite + testSetPrefix + "/" + file).toString('base64'),
                                    "filename": file
                                })
                        })
                        tests.push({
                            "testKey": caseId,
                            "status": testStatus,
                            "comment": failureDetail,
                            "evidences": evidences
                        })
                    }catch(e){
                        console.log("\r\n!!!Warning: " + caseId + " is no evidence found\r\n");
                        tests.push({
                            "testKey": caseId,
                            "comment": "Missing evidence file(s)",
                            "status": "EXECUTING"
                        });
                    }
                    result = {
                        "testExecutionKey": testExecutionId,
                        "info": {
                            "testPlanKey": testPlanId
                        },
                        "tests": tests
                    }
                break;
                case'updateResult':
                    newman.run({
                        collection: JSON.parse(fs.readFileSync('./util/xray update.postman_collection.json')),
                        folder: "import test result",
                        environment: './util/xray update.postman_environment.json',
                        envVar: [{type:'any', value:JSON.stringify(result), key:"result" }],
                        insecure: true
                    })
                    .on('request', (error,args) => {
                        if(error != null){
                            console.log("Call Failed");
                            console.log(JSON.stringify(error, null, 4));
                        }
                        var uploadResult = JSON.parse(args.response.stream.toString())
                        try {
                            if(uploadResult.testIssues.success[0].key != caseId)
                                console.log(JSON.stringify(uploadResult, null, 4));
                        }catch(e){
                            console.log(caseId + ' Import Result Failed!!!!!!!!!!!!!')
                            console.log(JSON.stringify(uploadResult, null, 4));
                        }
                        
                    })
                    .on('exception', (error,args)=> {
                        console.log("Exception:");
                        console.log(args);
                    })
                    .on('done', (error,args)=> {
                        if(error != null)
                            console.log(error);
                    });
                break;
                default:
                    return result;
            }
        }
    else
        console.log("!!!The Case ID is empty!!!");
}
module.exports = { updateResult: updateResult };