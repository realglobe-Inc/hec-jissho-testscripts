function parseLine (line) {
  let [time, body, other] = line.split(' GMT ')
  if (!body) {
    return {
      failed: true,
      type: 'nobody',
      err: new Error(`Parse line failed 'no body' : ${line}`)
    }
  }
  if (other) {
    return {
      failed: true,
      type: 'other',
      err: new Error(`Parse line failed 'other': ${line}`)
    }
  }
  let date = new Date(time + ' GMT')
  if (date.toString() === 'Invalid Date') {
    return {
      failed: true,
      type: 'invalid date',
      err: new Error(`Parse line failed 'invalid date': ${line}`)
    }
  }
  return {
    date,
    body
  }
}

if (!module.parent) {
  let line = "Tue, 14 Feb 2017 06:41:16 GMT hec:db Executing (default): INSERT INTO `report_info` (`id`,`report_full_id`,`lat`,`lng`,`event`,`date`,`info`,`createdAt`,`updatedAt`) VALUES (DEFAULT,'qq:reporter:680194752#949591708',35.7099064868647,139.75936882276145,'actor:update','2017-02-14 06:40:43','','2017-02-14 06:40:59','2017-02-14 06:40:59');"
  console.log(parseLine(line))
}

module.exports = parseLine
