#!/usr/bin/env node
require('shelljs/global')
const IdExtractor = require('./helpers/id_extractor')
const arrangeLog = require('./helpers/arrange_log')
const selectLogfile = require('./helpers/select_logfile')
const { Paths, Experiments } = require('./helpers/constants')
const co = require('co')

/**
 * 接続通報実験のログを評価する
 */
function evalCon () {
  return co(function * () {
    let experiment = Experiments.DIS_REPORT[0]
    let logName = selectLogfile(experiment)

    console.log(logName)

    let appLog = yield arrangeLog(
      logName,
      Paths.APP,
      IdExtractor.app.report
    )

    let clientLog = yield arrangeLog(
      logName,
      Paths.CLIENT,
      IdExtractor.client.report
    )

    let browserLog = yield arrangeLog(
      logName,
      Paths.BROWSER,
      IdExtractor.browser.report
    )

    console.log(appLog.length)
    console.log(clientLog.length)
    console.log(browserLog.length)
  })
}

evalCon().catch(e => console.error(e))
