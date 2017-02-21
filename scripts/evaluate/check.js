#!/usr/bin/env node
/**
 * 正しくログが取れているかチェックする
 */
require('shelljs/global')
const { Paths, Experiments } = require('./helpers/constants.js')
const assert = require('assert')
const compareSets = require('compare-sets')

const logfileToExperiment = (file) => {
  let split = file.split('_')
  let slice = split.slice(0, -1)
  let name = slice.join('_')
  return name
}

check()

function check () {
  let experiments = new Set(Experiments.ALL.map(({ name }) => name))
  let exFromFiles = new Set(ls(Paths.APP[0]).map(logfileToExperiment))
  let {
    added,
    removed
  } = compareSets(experiments, exFromFiles)
  console.log(added)
  console.log(removed)
  assert.equal(added.size, 0)
  assert.equal(removed.size, 0)
}

/* global ls */
