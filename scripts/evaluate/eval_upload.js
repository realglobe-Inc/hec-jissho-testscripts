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
const vmstat = require('./helpers/vmstat')

function evalUploadAll () {
  return co(function * () {
    const jsonPath = join(__dirname, '../../results/upload.json')

    let allResult = []
    for (let exp of Experiments.UPLOAD) {
      let result = yield evalUpload(exp)
      allResult.push(result)
    }

    console.log('Adding vmstat info to each result...')
    let results = yield vmstat.addToResults(allResult)

    let json = JSON.stringify(results, null, '  ')
    fs.writeFileSync(jsonPath, json)
  })
}

function evalUpload (experiment) {
  return co(function * () {
    let logName = selectLogfile(experiment.name)

    console.log('Evaluate ', logName)

    // 画像のPOSTが始まった時間と終わった時間がわかる
    let clientLog = yield arrangeLog(
      logName,
      Paths.CLIENT,
      IdExtractor.client.upload
    )

    let starts = clientLog.filter(data => data.id.state === 'start')
    let finishes = clientLog.filter(data => data.id.state === 'finish')

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

    for (let start of starts) {
      let finish = finishes.find(finish => finish.id.id === start.id.id)
      if (finish) {
        let time = finish.date - start.date
        rawData.push(time / 1000)
        result
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

evalUploadAll().catch(e => console.error(e))
