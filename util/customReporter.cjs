'use strict';
require('util');
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
        {id: 'duration', title: 'Duration'}
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

// this reporter outputs test results, indenting two spaces per suite
class MyReporter {
    constructor(runner) {
        this._indents = 0;
        const stats = runner.stats;

        let executionDate = '';

        runner
        .on(EVENT_RUN_BEGIN, () => {
            // console.log(">>>>>>>>>>>>>Custom report:");
            // console.log(global.testSuite);
            // console.log("report run begin: " + order++);
            
        })
        .on(EVENT_TEST_BEGIN, () => {
            // console.log("report test begin: " + order++);
            executionDate = (new Date()).toISOString();
            // console.log(">>>>>>>>>>>>>Custom report:" + global.iteration.iterationName);
            
        })
        .on(EVENT_TEST_END, () => {
            // console.log("report test end: " + order++);
            // executionDate = (new Date()).toISOString();
            // console.log(">>>>>>>>>>>>>Custom report:" + global.iteration.iterationName);
            
        })
        .on(EVENT_SUITE_BEGIN, (test) => {
            // console.log("report suite begin: " + order++);
            // console.log(test.title);
            // console.log(global.testNo);
            this.increaseIndent();
            // console.log(">>>>>>>>>>>>>Custom suite:" + global.testSuite[global.testNo].scenario);
        })
        .on(EVENT_SUITE_END, () => {
            // console.log("report suite end: " + order++);
            this.decreaseIndent();
        })
        .on(EVENT_TEST_PASS, (test) => {
            // console.log("report pass: " + order++);
            // console.log("test pass content");
            writeCSV.writeRecords([{
                suite: test.parent.title,
                case: test.title,
                result: 'Fail',
                date: executionDate,
                duration: test.duration
            }]).then(()=>{
                console.log("save success");
            }).catch((err)=>{
                console.log("err: " + err);
            });
            // Test#fullTitle() returns the suite name(s)
            // prepended to the test title
            // console.log(`${this.indent()}pass: ${test.fullTitle()}`);

        })
        .on(EVENT_TEST_FAIL, (test, err) => {
            // console.log("report fail: " + order++);
            // console.log("test fail content");
            // console.log(test.duration);
            // console.log(test.parent.title);
            // console.log(test.title);
            // console.log(executionDate);
            writeCSV.writeRecords([{
                suite: test.parent.title,
                case: test.title,
                result: 'Fail',
                date: executionDate,
                duration: test.duration
                }]).then(()=>{
                    console.log("save success");
                }).catch((err)=>{
                    console.log("err: " + err);
                });
            // console.log(test);
            // console.log(
            //   `${this.indent()}fail: ${test.fullTitle()} - error: ${err.message}`
            // );
        })
        .on(EVENT_RUN_END, () => {
            // console.log("report run end: " + order++);
            // console.log(`end: ${stats.passes}/${stats.passes + stats.failures} ok`);
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