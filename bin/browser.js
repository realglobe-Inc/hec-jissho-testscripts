#! /usr/bin/env node
/**
 * ブラウザーからシステム画面を開く
 */

const co = require('co')
const Phantom = require('phantom')

const {
  URL = 'http://localhost:3000/jissho3/system.html'
  // URL = `https://edac.online/jissho3/system.html`
} = process.env

let phantom

co(function * () {
  phantom = yield Phantom.create([], { logLevel: 'info' })
  let page = yield phantom.createPage()

  yield page.property('onConsoleMessage', function (msg, lineNum, sourceId) {
    console.log('CONSOLE', msg)
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
  yield page.property('onLoadFinished', function () {})

  let status = yield page.open(URL)
  if (status !== 'success') {
    throw new Error(`Status: ${status}`)
  }

  yield page.evaluate(function () {
    window.setTimeout(function () {
      console.log(document.getElementsByClassName('header')[0].innerHTML)
    }, 1000)
  })

  console.log(`Opened ${URL}`)
}).catch(err => console.error(err))
  .then(() => {
    // console.log('Phantom exit.')
    // phantom.exit()
  })
