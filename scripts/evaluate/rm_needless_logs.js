require('shelljs/global')
const { join } = require('path')
const {
  Paths
} = require('./constants')
const APP_DIR = Paths.APP[0]

exec(`du ${APP_DIR}/*.log`, { silent: true }).stdout.trim().split('\n').forEach(line => {
  let [filesize, filename] = line.split('\t')
  let failed = Number(filesize) < 20
  if (failed) {
    rm(filename)
  }
})

ls(APP_DIR).forEach((filename) => {
  let invalidName = /\d×\d/.test(filename) || /^upload_b_50/.test(filename) || /^upload_b_10/.test(filename)
  if (invalidName) {
    rm(join(APP_DIR, filename))
  }
})

/* global exec rm  ls */
