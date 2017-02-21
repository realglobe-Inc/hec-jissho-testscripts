#!/usr/bin/env node
/**
 * 接続通報実験のログを評価する
 */
require('shelljs/global')
const IdExtractor = require('./id_extractor')
const arrangeLog = require('./arrange_log')
const selectLogfile = require('./select_logfile')
const { Paths } = require('./constants')
const co = require('co')
const stats = require('./stats')

function evalReportExperiment (experiment) {
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
    experiment.startAt = clientLog[0].date
    experiment.endAt = clientLog[clientLog.length - 1].date
    let result = {
      experiment,
      count: {
        all: 0,
        success: 0,
        fail: 0
      }
    }
    let rawData = []
    for (let clientData of clientLog) {
      let firstRecieve = browserLog.find(
        ({id, date}) => id === clientData.id
      )
      if (firstRecieve) {
        let time = firstRecieve.date - clientData.date
        rawData.push(time / 1000)
        result.count.success++
      } else {
        result.count.fail++
      }
    }
    result.count.all = result.count.success + result.count.fail
    result.stats = stats(rawData)

    return result
  })
}

module.exports = evalReportExperiment
