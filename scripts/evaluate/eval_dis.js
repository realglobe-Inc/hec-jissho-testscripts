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
const vmstat = require('./helpers/vmstat')

function evalConAll () {
  return co(function * () {
    const experiments = Experiments.DIS_REPORT
    const jsonPath = join(__dirname, '../../results/report_disconnect.json')

    let allResult = []
    for (let exp of experiments) {
      let result = yield evalReportExperiment(exp)
      allResult.push(result)
    }

    console.log('Adding vmstat info to each result...')
    let results = yield vmstat.addToResults(allResult)

    let json = JSON.stringify(results, null, '  ')
    fs.writeFileSync(jsonPath, json)
  })
}

evalConAll().catch(e => console.error(e))
