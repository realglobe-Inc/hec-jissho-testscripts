const { join } = require('path')

const LOG_ROOT = join(__dirname, '../../../logs')

/**
 * 各実験ログディレクトリのパス
 */
const Paths = {
  LOG_ROOT,
  APP: ['app'].map(
    d => join(LOG_ROOT, d)
  ),
  CLIENT: [6, 7, 8, 9, 10].map(
    i => join(LOG_ROOT, `10.49.0.${i}`)
  ),
  BROWSER: [11, 12, 13, 14, 15].map(
    i => join(LOG_ROOT, `10.49.0.${i}`)
  )
}

// 2つの配列の直積を求める関数
let directProduct = (array1, array2) => {
  let product = []
  for (let value1 of array1) {
    for (let value2 of array2) {
      product.push([value1, value2])
    }
  }
  return product
}

let browsers = [1, 10, 50, 100, 150, 200, 500]
let reportSpeeds = [1, 10, 20, 30, 40, 50, 100]
let reportCons = [100, 200, 500, 1000, 2000, 5000]
let posts = [1, 10, 20, 50, 100]
let sizes = ['320x180', '1280x720', '1920x1080', '4096x2160']

/**
 * 各実験の名前。名前からログファイルを検索するため。
 */
const Experiments = {
  CON_REPORT: directProduct(
    browsers,
    reportCons
  ).map(
    ([browser, reporter]) => ({
      name: `conreport_b_${browser}_r_${reporter}`,
      browser,
      reporter
    })
  ),
  DIS_REPORT: directProduct(
    browsers,
    reportSpeeds
  ).map(
    ([browser, reportSpeed]) => ({
      name: `disreport_b_${browser}_r_${reportSpeed}`,
      browser,
      reportSpeed
    })
  ),
  UPLOAD: directProduct(
    posts,
    sizes
  ).map(
    ([post, size]) => ({
      name: `upload_b_1_p_${post}_s_${size}`,
      post,
      size
    })
  )
}
Experiments.ALL = (({CON_REPORT, DIS_REPORT, UPLOAD}) =>
  [].concat(CON_REPORT, DIS_REPORT, UPLOAD)
)(Experiments)

module.exports = {
  Paths,
  Experiments
}
