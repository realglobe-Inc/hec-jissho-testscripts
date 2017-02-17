require('shelljs/global')
const { Paths } = require('./constants.js')

/**
 * 実験名から app 下のログファイルを出す。複数ある場合には、最もファイルサイズの大きい物を「まともに取れたデータ」と考える
 * @param {string} exp - 実験名
 * @return {string} ログファイル名
 */
function selectLogfile (exp) {
  const APP_DIR = Paths.APP[0]
  let filenames = ls(APP_DIR).filter(filename => filename.startsWith(exp + '_'))
  let maxSize = -1
  let resFilename = ''
  let filesizes = exec(`du ${filenames.join(' ')}`, { cwd: APP_DIR, silent: true })
    .stdout
    .trim()
    .split('\n')
    .reduce((obj, line) => {
      let [size, name] = line.split('\t')
      return Object.assign(
        obj,
        { [name]: Number(size) }
      )
    }, {})
  for (let filename of filenames) {
    let filesize = filesizes[filename]
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
