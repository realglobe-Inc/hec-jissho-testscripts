#!/usr/bin/env node
require('shelljs/global')
const IdExtractor = require('./helpers/id_extractor')
const arrangeLog = require('./helpers/arrange_log')
const selectLogfile = require('./helpers/select_logfile')
const { Paths, Experiments } = require('./helpers/constants')
const co = require('co')
const stats = require('./helpers/stats')
const fs = require('fs')
const { join } = require('path')

function evalConAll () {
  return co(function * () {
    let allResult = {}
    for (let exp of Experiments.CON_REPORT) {
      let result = yield evalCon(exp)
      allResult[exp.name] = result
    }
    let filename = join(__dirname, '../../results/con_report.json')
    let filedata = JSON.stringify(allResult, null, '  ')
    fs.writeFileSync(filename, filedata)
  })
}

/**
 * 接続通報実験のログを評価する
 */
function evalCon (experiment) {
  return co(function * () {
    let logName = selectLogfile(experiment.name)

    console.log('Evaluate ', logName)

    // Reportインスタンスが生成された時間がわかる
    let clientLog = yield arrangeLog(
      logName,
      Paths.CLIENT,
      IdExtractor.client.report
    )

    // 最初の通報が到達した時間がわかる
    let browserLog = yield arrangeLog(
      logName,
      Paths.BROWSER,
      IdExtractor.browser.report
    )

    // 各通報について、clientでインスタンスを生成してから、最初に通報が到達するまでの時間を計測する
    // ミリ秒まではわからない
    let result = {
      experiment,
      count: {
        all: 0,
        success: 0,
        fail: 0
      },
      // seconds
      rawData: []
    }
    for (let clientData of clientLog) {
      let firstRecieve = browserLog.find(
        ({id, date}) => id === clientData.id
      )
      if (firstRecieve) {
        let time = firstRecieve.date - clientData.date
        result.rawData.push(time / 1000)
        result.count.success++
      } else {
        result.count.fail++
      }
    }
    result.count.all = result.count.success + result.count.fail
    result.stats = stats(result.rawData)
    // rawData は必要ない
    delete result.rawData

    return result
  })
}

evalConAll().catch(e => console.error(e))
