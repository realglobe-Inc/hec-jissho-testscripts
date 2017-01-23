#!/usr/bin/env node
/**
 * 画像を投稿する
 */
const {
  COUNT = 100,
  INTERVAL = 2000,
  URL = 'http://localhost:3000',
  CAMERA_TOKEN = 'b2c7deea-7b51-4cd7-bfc1-09e840063f64',
  CAMERA_UUID = '35f0c2f6-dc0d-459e-b5b8-c579de229697',
  IMG_SIZE = '320x180'
} = process.env

const co = require('co')
const fs = require('fs')
const { join } = require('path')
const asleep = require('asleep')
const arequest = require('arequest')
const debug = require('hec:rest:upload')

// Settings
const baseUrl = `${URL}/jissho3`
let request = arequest.create({ jar: true })
let imgPath = join(__dirname, `../misc/img/${IMG_SIZE}.jpg`)
let createPhoto = () => co(function * () {
  let pathname = `/rest/cameras/${CAMERA_UUID}/photos`
  let { statusCode, body } = yield request({
    url: `${baseUrl}${pathname}`,
    method: 'POST',
    formdata: {
      info: JSON.stringify({ foo: 'bar' }),
      token: CAMERA_TOKEN,
      image: fs.createReadStream(imgPath),
      extension: '.jpg'
    }
  })
  if (statusCode !== 201) {
    throw new Error(`Failed to create: ${JSON.stringify(body)} (at: ${pathname}, status code: ${statusCode})`)
  }
  return body.created
})

// Upload images
co(function * () {
  debug(`Start to upload. SIZE: ${IMG_SIZE}`)
  for (let i = 1; i <= COUNT; i++) {
    yield createPhoto()
    debug(`Photo uploaded ${i}.`)
    yield asleep(INTERVAL)
  }
  debug('Finish uploading.')
}).catch((err) => {
  console.error(err)
  process.exit(1)
})
