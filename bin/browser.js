#! /usr/bin/env node
/**
 * ブラウザーからシステム画面を開く
 */

const co = require('co')
const Phantom = require('phantom')
const debug = require('debug')

const {
  BASE_URL
} = require('../env')
const URL = BASE_URL + '/system.html'

let phantom

co(function * () {
  phantom = yield Phantom.create([], { logLevel: 'info' })
  let page = yield phantom.createPage()

  yield page.property('onConsoleMessage', function (msg, lineNum, sourceId) {
    console.log('CONSOLE', msg)
    // ここに通報や画像投稿のイベント検知
    var isReport = msg.startsWith('REPORT:')
    var isPhoto = msg.startsWith('PHOTO:')
    if (isReport) {

    }
    if (isPhoto) {

    }
  })
  yield page.property('onResourceRequested', function (request) {})
  yield page.property('onResourceReceived', function (response) {})
  yield page.property('onError', function (msg, trace) {
    console.log('ERROR', msg)
    if (trace && trace.length) {
      var stack = []
      stack.push('TRACE:')
      trace.forEach(function (t) {
        stack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''))
      })
      console.log(stack.join('\n'))
    }
  })
  yield page.property('onPrompt', function (msg, defaultValue) {
    console.log('PROMPT', msg)
    if (msg === 'Password?') {
      return 'realglobe'
    }
  })
  yield page.property('onAlert', function (msg) {
    console.log('ALERT', msg)
  })
  yield page.property('onConfirm', function (msg) {
    console.log('CONFIRM', msg)
    return true
  })

  let status = yield page.open(URL)
  if (status !== 'success') {
    throw new Error(`Status: ${status}`)
  }

  console.log(`Opened ${URL}`)
}).catch(err => console.error(err))
  .then(() => {
    // console.log('Phantom exit.')
    // phantom.exit()
  })
