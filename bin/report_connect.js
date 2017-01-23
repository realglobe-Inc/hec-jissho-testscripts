#! /usr/bin/env node
/**
 * 接続を維持して通報する
 */
const {
  // 通報数
  REPORTERS = 20,
  // 通報間隔(ms)
  REPORT_INTERVAL = 1000,
  // 次の通報を接続するまでの時間(ms)
  NEXT_INTERVAL = 200,
  // 1通報あたりの通報回数
  EMIT_COUNT = 600
} = process.env

process.env.DEBUG = 'hec:*'

const co = require('co')
const asleep = require('asleep')
const debug = require('debug')('hec:test:reporter')
const Report = require('../lib/report')
const Reporter = require('../lib/reporter')

co(function * () {
  for (let i = 0; i < REPORTERS; i++) {
    let reporter = new Reporter()
    yield reporter.actor.connect()

    let report = new Report()
    debug(`REPORT_FULL_ID=${reporter.actor.key}#${report.id}`)
    startEmit(reporter, report) // Not yield
    yield asleep(NEXT_INTERVAL)
  }
}).catch((err) => console.error(err))

function startEmit (reporter, report) {
  return co(function * () {
    for (let i = 0; i < EMIT_COUNT; i++) {
      reporter.emitter.emit('emergency', report.info())
      // debug('Emit: ', JSON.stringify(report.info()))
      yield asleep(REPORT_INTERVAL)
    }
  }).catch(e => console.error(e))
}
