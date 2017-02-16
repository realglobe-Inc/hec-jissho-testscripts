const { join } = require('path')

const LOG_ROOT = join(__dirname, '../../../logs')

const Paths = {
  LOG_ROOT,
  APP: ['app'].map(d => join(LOG_ROOT, d)),
  CLIENT: [6, 7, 8, 9, 10].map(i => join(LOG_ROOT, `10.49.0.${i}`)),
  BROWSER: [11, 12, 13, 14, 15].map(i => join(LOG_ROOT, `10.49.0.${i}`))
}

const EXPERIMENTS = (() => {
  let names = []
  let browsersSet = [1, 10, 50, 100, 150, 200, 500]
  let reportPerSecSet = [1, 10, 20, 30, 40, 50, 100]
  let reportsSet = [100, 200, 500, 1000, 2000, 5000]
  let postsSet = [1, 10, 20, 50, 100]
  let sizeSet = ['320x180', '1280x720', '1920x1080', '4096x2160']
  for (let b of browsersSet) {
    for (let r of reportPerSecSet) {
      names.push(`disreport_b_${b}_r_${r}`)
    }
    for (let r of reportsSet) {
      names.push(`conreport_b_${b}_r_${r}`)
    }
  }
  for (let p of postsSet) {
    for (let s of sizeSet) {
      names.push(`upload_b_1_p_${p}_s_${s}`)
    }
  }
  names.sort()
  return names
})()

module.exports = {
  Paths,
  EXPERIMENTS
}
