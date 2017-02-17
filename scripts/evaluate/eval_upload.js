#!/usr/bin/env node
/**
 * 画像投稿実験のログを評価する
 */
require('shelljs/global')
const { Paths, Experiments } = require('./helpers/constants')
const IdExtractor = require('./helpers/id_extractor')
const arrangeLog = require('./helpers/arrange_log')
const selectLogfile = require('./helpers/select_logfile')
const stats = require('./helpers/stats')
const co = require('co')
const fs = require('fs')
const { join } = require('path')

function evalUploadAll () {
  return co(function * () {
    let allResult = {}
    for (let exp of Experiments.UPLOAD) {
      let result = yield evalUpload(exp)
      allResult[exp.name] = result
    }
    let filename = join(__dirname, '../../results/upload.json')
    let filedata = JSON.stringify(allResult, null, '  ')
    fs.writeFileSync(filename, filedata)
  })
}

function evalUpload (experiment) {
  return co(function * () {
    let logName = selectLogfile(experiment.name)

    console.log('Evaluate ', logName)

    // 画像のPOSTが終わった時間がわかる
    let clientLog = yield arrangeLog(
      logName,
      Paths.CLIENT,
      IdExtractor.client.upload
    )

    // 画像がブラウザに到達した時間がわかる
    let browserLog = yield arrangeLog(
      logName,
      Paths.BROWSER,
      IdExtractor.browser.upload
    )

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

evalUploadAll().catch(e => console.error(e))
