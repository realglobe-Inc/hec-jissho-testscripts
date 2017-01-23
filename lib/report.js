class Report {
  constructor () {
    const s = this
    s.id = randInt()
    s.location = randLocation()
    s.heartRate = 0
  }

  info () {
    const s = this
    const {id, location, heartRate} = s
    let date = (new Date()).toISOString()
    return {
      id,
      location,
      heartRate,
      date
    }
  }
}

function randInt () {
  return Math.floor(Math.random() * 1000000000)
}

function randLocation () {
  let lat = 35.700275 + Math.random() * 0.01
  let lng = 139.753314 + Math.random() * 0.01
  return [lat, lng, 10.22]
}

module.exports = Report
