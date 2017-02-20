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
const jsonCsv = require('json-csv')

function evalUploadAll () {
  return co(function * () {
    const jsonPath = join(__dirname, '../../results/upload.json')
    const csvPath = join(__dirname, '../../results/upload.csv')

    let allResult = []
    for (let exp of Experiments.UPLOAD) {
      let result = yield evalUpload(exp)
      allResult.push(result)
    }
    let json = JSON.stringify(allResult, null, '  ')
    fs.writeFileSync(jsonPath, json)

    let csv = yield new Promise((resolve, reject) => {
      jsonCsv.csvBuffered(allResult, {
        fields: [
          {
            name: 'experiment.post',
            label: '1秒あたりの画像POST数'
          },
          {
            name: 'experiment.size',
            label: '画像サイズ'
          },
          {
            name: 'count.all',
            label: 'クライアントPOST試行数'
          },
          {
            name: 'count.success',
            label: 'クライアントPOST成功数'
          },
          {
            name: 'count.fail',
            label: 'クライアントPOST失敗数'
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
