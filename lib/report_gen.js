#! /usr/bin/env node
/**
 * 接続を維持して通報する
 */
const {
   BASE_URL,
   SOCKET_IO_PATH
} = require('../env')

const url = require('url')
const sugoActor = require('sugo-actor')
const { Module } = sugoActor

class ReporGen {
  constructor () {
    const s = this
    let reporter = new Module({})
    let {protocol, host} = url.parse(BASE_URL)
    s.reporter = reporter
    s.actor = sugoActor({
      protocol,
      host,
      key: `qq:reporter:${randInt()}`,
      path: SOCKET_IO_PATH,
      modules: { reporter }
    })
  }
}

function randInt () {
  return Math.floor(Math.random() * 1000000000)
}

module.exports = ReporGen
