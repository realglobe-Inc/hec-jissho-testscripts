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
const jsonCsv = require('json-csv')
const CSV_FIELDS = require('./src/csv_fields.json')

function evalConAll () {
  return co(function * () {
    const experiments = Experiments.DIS_REPORT
    const jsonPath = join(__dirname, '../../results/disconnect_report.json')
    const csvPath = join(__dirname, '../../results/disconnect_report.csv')

    let allResult = []
    for (let exp of experiments) {
      let result = yield evalReportExperiment(exp)
      allResult.push(result)
    }

    let json = JSON.stringify(allResult, null, '  ')
    fs.writeFileSync(jsonPath, json)

    let csv = yield new Promise((resolve, reject) => {
      jsonCsv.csvBuffered(allResult, {
        fields: CSV_FIELDS['DIS_REPORT']
      }, (err, csv) => err ? reject(err) : resolve(csv))
    })
    fs.writeFileSync(csvPath, csv)
  })
}

evalConAll().catch(e => console.error(e))
