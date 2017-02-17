#!/usr/bin/env node
/**
 * 画像を投稿する
 */
const {
  BASE_URL,
  CAMERA_TOKEN,
  CAMERA_UUID
} = require('../env')

const {
  // 1秒あたりのPOST回数
  POSTS_PAR_SECOND = 1,
  // 画像投稿数
  COUNT = 5000,
  // 画像サイズ
  IMG_SIZE = '320x180'
} = process.env

process.env.DEBUG = 'hec:*'

const co = require('co')
const fs = require('fs')
const { join } = require('path')
const asleep = require('asleep')
const arequest = require('arequest')
const debug = require('debug')('hec:rest:upload')

// Settings
let request = arequest.create({ jar: true })
let imgPath = join(__dirname, `../misc/img/${IMG_SIZE}.jpg`)
let image = fs.readFileSync(imgPath)
let pathname = `/jissho3/rest/cameras/${CAMERA_UUID}/photos`
let createPhoto = () => co(function * () {
  debug(`Upload ${uuid}`)
  let { statusCode, body } = yield request({
    url: `${BASE_URL}${pathname}`,
    method: 'POST',
    formData: {
      info: JSON.stringify({}),
      token: CAMERA_TOKEN,
      image,
      extension: '.jpg'
    }
  })
  if (statusCode !== 201) {
    debug('Failed')
  }
  let { uuid } = body.created
}).catch(handleError)

// Upload images
co(function * () {
  let INTERVAL = 1000 / POSTS_PAR_SECOND
  debug(`Start to upload. SIZE: ${IMG_SIZE}`)
  for (let i = 1; i <= COUNT; i++) {
    createPhoto() // Not yield
    yield asleep(INTERVAL)
  }
}).catch(handleError)

function handleError (err) {
  console.error(err)
}
