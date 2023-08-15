'use strict';
require('util');
const updateInstantResult = require('./updateInstantResult.cjs')
const Mocha = require('mocha');
const csvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const writeCSV = csvWriter({
    path: 'result/result.csv',
    header: [
        {id: 'suite', title: 'Test Suite'},
        {id: 'case', title: 'Summary'},
        {id: 'result', title: 'Result'},
        {id: 'date', title: 'Execution Date'},
        {id: 'duration', title: 'Duration(ms)'}
    ],
    append: false
});
const {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END,
  EVENT_TEST_PENDING,
  EVENT_TEST_RETRY,
  STATE_IDLE,
  STATE_RUNNING,
  STATE_STOPPED,
  EVENT_TEST_BEGIN,
  EVENT_TEST_END,
  EVENT_HOOK_BEGIN,
  EVENT_HOOK_END
} = Mocha.Runner.constants;

let order = 0;
let testExecutionId = process.env.npm_config_execId;
let testPlanId = process.env.npm_config_planId;
let updateJiraResult;
try{
    updateJiraResult = JSON.parse(fs.readFileSync(process.env.npm_config_config)).updateJiraResult;
} catch(e) {
    updateJiraResult = JSON.parse(fs.readFileSync('./config/config.json')).updateJiraResult;
}

// this reporter outputs test results, indenting two spaces per suite
class MyReporter {
    constructor(runner) {
        this._indents = 0;
        const stats = runner.stats;

        let executionDate = '';

        runner
        .on(EVENT_RUN_BEGIN, () => {
        })
        .on(EVENT_TEST_BEGIN, (test) => {       
        })
        .on(EVENT_TEST_END, () => {
        })
        .on(EVENT_SUITE_BEGIN, (test) => {
            this.increaseIndent();
        })
        .on(EVENT_SUITE_END, () => {
            this.decreaseIndent();
        })
        .on(EVENT_TEST_PASS, (test) => {
            console.log("Case \"" + test.title + "\" is passed");
            writeCSV.writeRecords([{
                suite: test.parent.title,
                case: test.title,
                result: 'Passed',
                date: executionDate,
                duration: test.duration
            }]).then(()=>{
                console.log("Saved result");
            }).catch((err)=>{
                console.log("err: " + err);
            });
            if(updateJiraResult)
                updateInstantResult.updateResult(
                    testPlanId, testExecutionId,
                    test.title.split(':')[0],
                    test.parent.title,
                    'PASS'
                );
        })
        .on(EVENT_TEST_FAIL, (test, err) => {
            console.log("Case \"" + test.title + "\" is failed");
            writeCSV.writeRecords([{
                suite: test.parent.title,
                case: test.title,
                result: 'Failed',
                date: executionDate,
                duration: test.duration
            }]).then(()=>{
                console.log("Saved result");
            }).catch((err)=>{
                console.log("err: " + err);
            });
            if(updateJiraResult)
                updateInstantResult.updateResult(
                    testPlanId,
                    testExecutionId,
                    test.title.split(':')[0],
                    test.parent.title,
                    'FAIL',
                    JSON.stringify(err, null, 4)
                );
        })
        .on(EVENT_RUN_END, () => {
            console.log(`Test ended: ${stats.passes}/${stats.passes + stats.failures}`);
        });
    }

    indent() {
        return Array(this._indents).join('  ');
    }

    increaseIndent() {
        this._indents++;
    }

    decreaseIndent() {
        this._indents--;
    }
}

module.exports = MyReporter;