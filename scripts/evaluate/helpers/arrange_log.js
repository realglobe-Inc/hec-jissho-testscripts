const readlineAsync = require('./readline_async')
const parseLine = require('./parse_line')
const co = require('co')
const { join } = require('path')

function arrangeLog (logName, targetDirs, extractor) {
  return co(function * () {
    let logPaths = targetDirs
      .map(dir => join(dir, logName))
      .filter(path => test('-f', path))
    let logs = yield logPaths.map(
      path => _arrangeSingleLog(path, extractor)
    )
    let log = [].concat(...logs)
    return log
  })
}

function _arrangeSingleLog (path, extractFunc) {
  return readlineAsync(path, (line) => {
    let { err, body = '', date } = parseLine(line)
    if (err) {
      throw err
    }
    let id = extractFunc(body)
    if (!id) {
      return null
    }
    return {
      date,
      id
    }
  })
}

module.exports = arrangeLog

/* global test */
