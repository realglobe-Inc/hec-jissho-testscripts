#! /usr/bin/env node
/**
 * 通報したら接続を切断する
 */
const {
  // 1秒あたりの通報回数
  REPORT_PER_SECOND = 10,
  // 最大通報回数
  MAX_REPORTS = 100000
} = process.env

process.env.DEBUG = 'hec:*'

const co = require('co')
const asleep = require('asleep')
const debug = require('debug')('hec:test:reporter')
const Report = require('../lib/report')
const Reporter = require('../lib/reporter')

co(function * () {
  const interval = 1000 / REPORT_PER_SECOND
  for (let i = 0; i < MAX_REPORTS; i++) {
    reportOnce() // Not yield
    yield asleep(interval)
  }
}).catch((err) => console.error(err))

function reportOnce () {
  return co(function * () {
    let reporter = new Reporter()
    yield reporter.actor.connect()
    let report = new Report()
    reporter.emitter.emit('emergency', report.info())
    debug(`REPORT_FULL_ID=${reporter.actor.key}#${report.id}`)
    yield reporter.actor.disconnect()
  })
}
