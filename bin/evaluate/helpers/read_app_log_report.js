const readline = require('linebyline')
const parseLine = require('./parse_line')
const { join } = require('path')
const { LOG_ROOT } = require('./constants')

function readAppLog (path) {
  return new Promise((resolve, reject) => {
    let reader = readline(path)
    let logs = []
    reader.on('line', (line, lineCount, byteCount) => {
      let obj = parseLine(line)
      if (obj.failed) {
        if (obj.type === 'nobody') {
          return
        }
        reject(obj.err)
      } else {
        let reportFullId = getReportFullId(obj.body)
        if (reportFullId) {
          logs.push({
            date: obj.date,
            reportFullId
          })
        }
      }
    })
    reader.on('error', (e) => {
      reject(e)
    })
    reader.on('end', () => {
      resolve(logs)
    })
  })
}

function getReportFullId (logBody) {
  const OBSERVER = 'hec:report-observer Observer recieve report'
  // qq:reporter:446691096#859154934
  const re = /qq:reporter:[0-9#]+/
  if (logBody.startsWith(OBSERVER)) {
    let body = logBody.match(re)
    return body[0]
  } else {
    return false
  }
}

if (!module.parent) {
  let path = join(LOG_ROOT, 'app/conreport_b_200_r_500_aor.log')
  readAppLog(path).then(d => console.log(d))
}
