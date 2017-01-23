#!/usr/bin/env node

process.env.DEBUG = 'hec:*'

const debug = require('debug')('hec:test:browser')
const { spawn } = require('child_process')
const { join } = require('path')

process.chdir(join(__dirname, '..'))

const phantom = spawn('./bin/scripts/phantom.js')
phantom.stdout.on('data', (data) => {
  debug(data.toString().trim())
})
phantom.stderr.on('data', (data) => {
  console.error(data.toString())
})
