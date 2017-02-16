const readlineAsync = require('./readline_async')
const parseLine = require('./parse_line')

function readLog (path, extractFunc) {
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

module.exports = readLog
