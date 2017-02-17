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
        fields: [
          {
            name: 'experiment.reportSpeed',
            label: '通報(回/秒)'
          },
          {
            name: 'experiment.browser',
            label: 'ブラウザ数'
          },
          {
            name: 'count.all',
            label: '通報試行数'
          },
          {
            name: 'count.success',
            label: '通報到達数'
          },
          {
            name: 'count.fail',
            label: '通報到達失敗数'
          },
          {
            name: 'stats.mean',
            label: '平均秒'
          },
          {
            name: 'stats.max',
            label: '最大秒'
          },
          {
            name: 'stats.min',
            label: '最小秒'
          },
          {
            name: 'stats.median',
            label: '中央値'
          },
          {
            name: 'stats.stdev',
            label: '標準偏差'
          }
        ]
      }, (err, csv) => err ? reject(err) : resolve(csv))
    })
    fs.writeFileSync(csvPath, csv)
  })
}

evalConAll().catch(e => console.error(e))
