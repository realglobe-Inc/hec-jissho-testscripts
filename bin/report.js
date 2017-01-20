#!/usr/bin/env node
/**
 * 指定された URL に通報する
 */
const {
  URL = 'http://localhost:3000',
  ACTOR_KEY = `qq:reporter:${randInt()}`,
  REPORT_INTERVAL = 1000,
  REPORT_COUNT = 1000
} = process.env

const co = require('co')
const asleep = require('asleep')
const sugoActor = require('sugo-actor')
const { Module } = sugoActor
const debug = require('debug')('hec:reporter')

class Report {
  constructor () {
    const s = this
    s.id = randInt()
    s.location = randLocation()
    s.heartRate = 0
  }

  info () {
    const s = this
    const {id, location, heartRate} = s
    let date = (new Date()).toISOString()
    return {
      id,
      location,
      heartRate,
      date
    }
  }
}

co(function * () {
  let reporter = new Module({})
  let actor = sugoActor(URL, {
    key: ACTOR_KEY,
    path: '/jissho3/sugos/report/socket.io',
    modules: { reporter }
  })
  yield actor.connect()

  let report = new Report()
  debug('Actor key:', ACTOR_KEY)
  debug('Report id: ', report.id)

  let count = REPORT_COUNT
  while (count--) {
    reporter.emit('emergency', report)
    debug(`Emited report ${ACTOR_KEY}`)
    yield asleep(REPORT_INTERVAL)
  }
  yield actor.disconnect()
}).catch((err) => console.error(err))

// --- Functions ---

function randInt () {
  return Math.floor(Math.random() * 1000000)
}

function randLocation () {
  let lat = 35.700275 + Math.random() * 0.01
  let lng = 139.753314 + Math.random() * 0.01
  return [lat, lng, 10.22]
}
