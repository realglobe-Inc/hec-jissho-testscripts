#!/usr/bin/env node
const fs = require('fs')
const { join } = require('path')
const jsonCsv = require('json-csv')
const CSV_FIELDS = require('./src/csv_fields.json')

/**
 * results/*.json から results/*.csv を生成する
 */
function jsonToCsv (names) {
  for (let name of names) {
    let results = require(join('../../results', `${name}.json`))
    jsonCsv.csvBuffered(results, {
      fields: CSV_FIELDS[name].concat(CSV_FIELDS['common'])
    }, (err, csv) => {
      if (err) {
        throw err
      }
      fs.writeFileSync(join(__dirname, '../../results', `${name}.csv`), csv)
    })
  }
}

jsonToCsv(['report_connect', 'report_disconnect', 'upload'])
