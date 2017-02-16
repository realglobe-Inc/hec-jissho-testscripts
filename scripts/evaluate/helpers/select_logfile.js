require('shelljs/global')
const { Paths } = require('./constants.js')

/**
 * 実験名から app 下のログファイルを出す。複数ある場合には、最もファイルサイズの大きい物を「まともに取れたデータ」と考える
 * @param {string} exp - 実験名
 * @return {string} ログファイル名
 */
function selectLogfile (exp) {
  const APP_DIR = Paths.APP[0]
  let filenames = ls(APP_DIR).filter(filename => filename.startsWith(exp))
  let maxSize = -1
  let resFilename = ''
  for (let filename of filenames) {
    let duRes = exec(`du ${APP_DIR}/${filename}`, { silent: true })
    let filesize = Number(duRes.stdout.split('\t')[0])
    if (filesize > maxSize) {
      maxSize = filesize
      resFilename = filename
    }
  }
  return resFilename
}

if (!module.parent) {
  let name = selectLogfile('conreport_b_1_r_100')
  console.log(name)
}

module.exports = selectLogfile

/* global ls exec */
