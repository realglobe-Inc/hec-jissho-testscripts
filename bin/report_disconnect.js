#! /usr/bin/env node
/**
 * 通報したら接続を切断する
 */
const {
  // 1秒あたりの通報回数
  REPORT_PER_SECOND = 1,
  // 最大通報回数
  MAX_REPORTS = 100000
} = process.env

process.env.DEBUG = 'hec:*'

const co = require('co')
const asleep = require('asleep')
const debug = require('debug')('hec:test:reporter')
const Report = require('../lib/report')
const ReportGen = require('../lib/report_gen')

co(function * () {
  const interval = 1000 / REPORT_PER_SECOND
  for (let i = 0; i < MAX_REPORTS; i++) {
    reportOnce() // Not yield
    yield asleep(interval)
  }
}).catch((err) => console.error(err))

function reportOnce () {
  return co(function * () {
    let {actor, reporter} = new ReportGen()
    yield actor.connect()
    let report = new Report()
    yield asleep(1000) // Server側で caller が生成されるのを待つ
    reporter.emit('emergency', report.info())
    debug(`REPORT_FULL_ID=${actor.key}#${report.id}`)
    yield actor.disconnect()
  }).catch(e => console.error(e))
}
