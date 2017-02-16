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
        let uuid = getPhotoID(obj.body)
        if (uuid) {
          logs.push({
            date: obj.date,
            uuid
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

// hec:db Executing (default): INSERT INTO `photo` (`id`,`image`,`uuid`,`createdAt`,`updatedAt`,`cameraId`) VALUES (DEFAULT,'/uploaded/photos/35f0c2f6-dc0d-459e-b5b8-c579de229697/0133d37e-a504-4bfe-add7-f60c17770bf1.jpg','0133d37e-a504-4bfe-add7-f60c17770bf1','2017-02-15 10:17:17','2017-02-15 10:17:17',100);
// Database にインサートした時間をとる
const LOG_HEAD = 'hec:db Executing (default): INSERT INTO `photo`'
const REG = /\/([0-9a-z-]+)\.jpg/
function getPhotoID (logBody) {
  if (logBody.startsWith(LOG_HEAD)) {
    let body = logBody.match(REG)
    return body[1]
  } else {
    return false
  }
}

if (!module.parent) {
  let path = join(LOG_ROOT, 'app/upload_b_1_p_20_s_320x180_uxr.log')
  readAppLog(path).then(d => console.log(d))
}
