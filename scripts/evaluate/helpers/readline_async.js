const readline = require('linebyline')

/**
 * ファイルを一行ずつ読み込んで、callbackで評価した値を配列に突っ込んで返す
 * @param {string} path - ファイルパス
 * @param {function} callback
 */
function readlineAsync (path, callback) {
  return new Promise((resolve, reject) => {
    let reader = readline(path)
    let resArray = []
    reader.on('line', (line) => {
      let res = callback(line)
      // res が空の場合には push しない
      if (res) {
        resArray.push(res)
      }
    })
    reader.on('error', (e) => {
      reject(e)
    })
    reader.on('end', () => {
      resolve(resArray)
    })
  })
}

module.exports = readlineAsync
