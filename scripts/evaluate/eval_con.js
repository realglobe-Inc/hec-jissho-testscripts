#!/usr/bin/env node
/**
 * 接続通報実験のログを評価する
 */
require('shelljs/global')
const { Experiments } = require('./helpers/constants')
const co = require('co')
const fs = require('fs')
const { join } = require('path')
const evalReportExperiment = require('./helpers/eval_report_experiment')

function evalConAll () {
  return co(function * () {
    let allResult = {}
    for (let exp of Experiments.CON_REPORT) {
      let result = yield evalReportExperiment(exp)
      allResult[exp.name] = result
    }
    let filename = join(__dirname, '../../results/con_report.json')
    let filedata = JSON.stringify(allResult, null, '  ')
    fs.writeFileSync(filename, filedata)
  })
}

evalConAll().catch(e => console.error(e))
