import '../util/util.js'; 
import csvtojson from 'csvtojson';
csvtojson().fromFile("./data/xray update/result.csv").then();
let testcsv = await csvtojson().fromFile("./data/xray update/result.csv");
function initEnv(iteration, testSet, instanceEnv, runCount) {
    let tests = [];
    testcsv.forEach((test)=>{
        let evidences = [];
        try{
            fs.readdirSync("./data/xray update/" + test.testKey).forEach((file)=>{
                evidences.push({
                    "data": fs.readFileSync("./data/xray update/" + test.testKey + "/" + file).toString('base64'),
                    "filename": file
                })
            })
            tests.push({
                "testKey": test.testKey,
                "status": test.status,
                "evidences": evidences
            })
        }catch(e){
            console.log("\r\n!!!Warning: " + test.testKey + " is no evidence found\r\n");
            tests.push(test);
        }
    })
    let result = {
        "testExecutionKey": iteration.CaseId,
        "info": {
            "summary": iteration.iterationName,
            "testPlanKey": iteration.testPlanKey
        },
        "tests": tests
    }
    instanceEnv = instanceEnv.filter(el => el['key'] != "result");
    instanceEnv.push({type:'any', value:JSON.stringify(result), key:"result" });
    return instanceEnv;
}
export { initEnv };