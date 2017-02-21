const readlineAsync = require('./readline_async')
const co = require('co')
const { join } = require('path')

const vmstatKeys = [
  'r',
  'b',
  'swpd',
  'free',
  'buff',
  'cache',
  'si',
  'so',
  'bi',
  'bo',
  'in',
  'cs',
  'us',
  'sy',
  'id',
  'wa',
  'st'
]
// 2017/02/16 15:09:00  1  0      0 3446552 133068 4375880    0    0     2    44  149   93  3  1 96  0  0

function parseLine (line) {
  let split = line.trim().split(/\s+/)
  let dates = split.slice(0, 2)
  let values = split.slice(2).map(v => Number(v))
  let invalid = isNaN(values[0])
  if (invalid) {
    return null
  }
  let date = new Date(dates.join(' '))
  let vmstat = vmstatKeys.reduce((obj, key, i) => Object.assign(obj, { [key]: values[i] }), {})
  let {
    us, sy, buff, cache, free
  } = vmstat
  let cpuUsage = us + sy
  let mem = (buff + cache) / (buff + cache + free)
  let memoryUsage = Math.round(mem * 1000) / 10
  return {
    date,
    cpuUsage,
    memoryUsage
  }
}

function listup (dir = 'redis') {
  return co(function * () {
    let logPath = join(__dirname, '../../../logs', dir, 'vmstat.log')
    let lines = yield readlineAsync(logPath, (line) => {
      let parsed = parseLine(line)
      if (!parsed) {
        return null
      }
      return parsed
    })
    lines = lines.filter(line => line)
    return lines
  })
}

function sliceVmstat (list, start, end) {
  return list.filter(({ date }) => start <= date && date <= end)
}

function peekUsage (list, start, end) {
  let rangeList = sliceVmstat(list, start, end)
  if (rangeList.length === 0) {
    return {}
  }
  let cpus = rangeList.map(({cpuUsage}) => cpuUsage)
  let memories = rangeList.map(({memoryUsage}) => memoryUsage)
  let cpuUsage = Math.max(...cpus)
  let memoryUsage = Math.max(...memories)
  return {
    cpuUsage,
    memoryUsage
  }
}

// これだけ export すればいい
function addToResults (results) {
  return co(function * () {
    // deep なコピーではないが OK
    let addedResults = [].concat(results)
    // vmstat of each vm
    let lists = yield ['app-vmstat', 'redis', 'db'].map(name => listup(name))
    for (let result of addedResults) {
      let { startAt, endAt } = result.experiment
      let start = new Date(startAt)
      let end = new Date(endAt)
      let peeks = lists.map(
        vs => peekUsage(vs, start, end)
      )
      result.vmstat = {
        app: peeks[0],
        redis: peeks[1],
        db: peeks[2]
      }
    }
    return addedResults
  })
}

if (!module.parent) {
  listup('redis')
  .then(list => {
    let results = require('../../../results/con_report.json')
    for (let result of results) {
      let start = new Date(result.experiment.startAt)
      let end = new Date(result.experiment.endAt)
      let peek = peekUsage(list, start, end)
      console.log(peek)
    }
  })
  .catch(e => console.error(e))
}

module.exports = {
  addToResults
}
