const {
  mean,
  median,
  mode,
  variance,
  stdev
} = require('stats-lite')
const { round10: round } = require('round10')

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
    mode: mode(data),
    variance: variance(data),
    stdev: stdev(data)
  }
  for (let key of Object.keys(info)) {
    let value = info[key]
    info[key] = value ? round(value) : 0
  }
  return info
}

module.exports = stats
