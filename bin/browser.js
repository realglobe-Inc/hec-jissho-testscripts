#!/usr/bin/env node

process.env.DEBUG = 'hec:*'

const Debug = require('debug')
const { spawn } = require('child_process')
const { join } = require('path')
const { BROWSERS = 1 } = process.env

process.chdir(join(__dirname, '..'))

for (let i = 1; i <= BROWSERS; i++) {
  const debug = Debug(`hec:browser:${i}`)
  const phantom = spawn('./bin/scripts/phantom.js')
  phantom.stdout.on('data', (data) => {
    debug(data.toString().trim())
  })
  phantom.stderr.on('data', (data) => {
    debug(data.toString())
  })
}
