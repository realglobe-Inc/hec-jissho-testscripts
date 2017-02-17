const {
  mean,
  median,
  stdev
} = require('stats-lite')

const round = (number) => Math.round(100 * number) / 100

/**
 * @param {Array<number>} data
 */
function stats (data) {
  let info = {
    len: data.length,
    mean: mean(data),
    max: Math.max(...data),
    min: Math.min(...data),
    median: median(data),
    stdev: stdev(data)
  }
  for (let key of Object.keys(info)) {
    let value = info[key]
    info[key] = value ? round(value) : 0
  }
  return info
}

module.exports = stats
