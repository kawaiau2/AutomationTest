import '../util/util.js'; 

let currentCoverage = [
    {'key': 'medicalCoverage', 'productType':'medical'},
    {'key': 'lifeCoverage', 'productType':'life'},
    {'key': 'savingsCoverage', 'productType':'savings'},
    {'key': 'accidentCoverage', 'productType':'accident'},
    {'key': 'criticalCoverage', 'productType':'criticalIllness'}
];
// let marital = {
//     Single: 'N',
//     Married: 'M',
//     Widowed: 'W',
//     Divorced: 'D'
// };
// let gender = {
//     Male: 'M',
//     Female: 'F'
// }

let env = {};
function initEnv(iteration, testSet, instanceEnv, runCount) {
    if(global.config.log.initEnv){
        console.log('init instnaceEnv')
        console.log(instanceEnv)
    }

    currentCoverage.forEach((coverage)=>{
        let currentCoverage = jsonQuery('data[key=' + coverage['key'] + '].value', {data: {data:instanceEnv}}).value
        if(hasData(currentCoverage)){
            instanceEnv.push({ type:'any', value:coverage['productType'], key:'productType' });
            instanceEnv.push({ type:'any', value:currentCoverage, key:'currentCoverage' });
        }               
    })
    
    return instanceEnv;
}
export { initEnv };