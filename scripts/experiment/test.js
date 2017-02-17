#! /usr/bin/env node
/**
 * 親 VM からテストを行う
 */
process.env.DEBUG = 'hec:test'

const { execSync } = require('child_process')
const { ok } = require('assert')
const debug = require('debug')('hec:test')
const sleep = (sec) => execSync(`sleep ${sec}`)

const USER = 'rg_fuji'
const WAIT = 60

const Ip = [
  ['APP', [3]],
  ['MYSQL', [4]],
  ['REDIS', [5]],
  ['A_CLIENT', [6]],
  ['A_BROWSER', [11]],
  ['CLIENTS', [6, 7, 8, 9, 10]],
  ['BROWSERS', [11, 12, 13, 14, 15]]
].reduce((obj, [name, array]) => Object.assign(obj, { [name]: array.map(n => `10.49.0.${n}`) }), {})

const Presets = {
  clean () {
    return [
      'pkill node || true',
      'pkill phantomjs || true'
    ]
  },
  _launch (path, logName) {
    return [
      'mkdir -p log',
      `(node ${path} &> log/${logName} &)`,
      'sleep 4'
    ]
  },
  launchApp: (logName) => Presets._launch('hec-jissho3/bin/app.js', logName),
  launchBrowser: (logName) => Presets._launch('hec-jissho-testscripts/bin/browser.js', logName),
  launchDisReport: (logName) => Presets._launch('hec-jissho-testscripts/bin/report_disconnect.js', logName),
  launchConReport: (logName) => Presets._launch('hec-jissho-testscripts/bin/report_connect.js', logName),
  launchUpload: (logName) => Presets._launch('hec-jissho-testscripts/bin/upload.js', logName)
}

const concatEnv = (envs) => envs.map(([key, value]) => `export ${key}=${value}`).join('; ')
const appEnv = () => concatEnv([
  ['JISSHO3_MYSQL_USER', 'root'],
  ['JISSHO3_MYSQL_HOST', Ip.MYSQL[0]],
  ['JISSHO3_MYSQL_PORT', '3306'],
  ['JISSHO3_MYSQL_PASSWORD', 'hogehoge'],
  ['JISSHO3_MYSQL_DBNAME', 'jissho3'],
  ['REDIS_URL', `redis://${Ip.REDIS[0]}:6379`],
  ['NODE_ENV', 'production'],
  ['DEBUG', 'sg:*,hec:*'],
  ['RG_GOOGLE_API_KEY', 'AIzaSyDnz3rIxZIUlyqpz4q0wVAJEBEv9uZcy1o'],
  ['PATH', '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/home/rg_fuji/node-v6.9.5-linux-x64/bin']
])
const BASE_URL = `http://${Ip.APP[0]}`
const disReportEnv = (reportPerSec) => concatEnv([
  ['BASE_URL', BASE_URL],
  ['REPORT_PER_SECOND', reportPerSec]
])
const conReportEnv = (reporters) => concatEnv([
  ['BASE_URL', BASE_URL],
  ['REPORTERS', reporters]
])
const uploadEnv = (postPerSecond, imgSize) => concatEnv([
  ['BASE_URL', BASE_URL],
  ['POSTS_PAR_SECOND', postPerSecond],
  ['IMG_SIZE', imgSize]
])
const browserEnv = (browsers) => concatEnv([
  ['BASE_URL', BASE_URL],
  ['PATH', `\\$PATH:/home/rg_fuji/hec-jissho-testscripts/phantom/bin`],
  ['BROWSERS', browsers]
])

function sshCommand (ips, commands) {
  let command = commands.join(' ; ')
  for (let ip of ips) {
    debug(`SSH ${ip} ${command}`)
    console.log(execSync(`ssh -i ~/.ssh/jose_rsa ${USER}@${ip} "${command}"`).toString())
  }
}

function resetApp (logName) {
  ok(logName)
  debug('Restart app')
  let commands = [
    appEnv(),
    ...Presets.clean(),
    'sleep 5',
    'rm hec-jissho3/server/public/uploaded/photos/35f0c2f6-dc0d-459e-b5b8-c579de229697/*',
    'node hec-jissho3/ci/db/db_seed.js', // DB
    `redis-cli -h ${Ip.REDIS[0]} flushall`, // Redis
    ...Presets.launchApp(logName)
  ]
  sshCommand(Ip.APP, commands)
}

function experimentDisReport (config) {
  let {
    browsers = 1, // must be 5 * n
    reportPerSec = 1
  } = config
  let salt = Math.random().toString(36).slice(-3)
  const logName = `disreport_b_${browsers}_r_${reportPerSec}_${salt}.log`
  const clientConf = reportPerSec > 1 ? {
    ips: Ip.CLIENTS,
    env: disReportEnv(reportPerSec / 5),
    launcher: Presets.launchDisReport(logName)
  } : {
    ips: Ip.A_CLIENT,
    env: disReportEnv(1),
    launcher: Presets.launchDisReport(logName)
  }
  experiment({
    logName,
    browsers,
    clientConf
  })
}

function experimentConReport (config) {
  let {
    browsers = 1, // must be 5 * n
    reporters = 100
  } = config
  let salt = Math.random().toString(36).slice(-3)
  const logName = `conreport_b_${browsers}_r_${reporters}_${salt}.log`
  const clientConf = {
    ips: Ip.CLIENTS,
    env: conReportEnv(reporters / 5),
    launcher: Presets.launchConReport(logName)
  }
  experiment({
    logName,
    browsers,
    clientConf
  })
}

function experimentUpload (config) {
  let {
    postPerSecond = 1,
    imgSize = '320x180',
    browsers = 1 // must be 5 * n
  } = config
  let salt = Math.random().toString(36).slice(-3)
  const logName = `upload_b_${browsers}_p_${postPerSecond}_s_${imgSize}_${salt}.log`
  const clientConf = postPerSecond > 1 ? {
    ips: Ip.CLIENTS,
    env: uploadEnv(postPerSecond / 5, imgSize),
    launcher: Presets.launchUpload(logName)
  } : {
    ips: Ip.A_CLIENT,
    env: uploadEnv(postPerSecond, imgSize),
    launcher: Presets.launchUpload(logName)
  }
  experiment({
    logName,
    browsers,
    clientConf
  })
}

function experiment (conf) {
  let {
    logName,
    browsers,
    clientConf
  } = conf
  debug(`Experiment ${logName}`)
  resetApp(logName)

  const browserConf = browsers > 1 ? {
    ips: Ip.BROWSERS,
    env: browserEnv(browsers / 5)
  } : {
    ips: Ip.A_BROWSER,
    env: browserEnv(1)
  }

  debug('Clean')
  let ips = [].concat(clientConf.ips, browserConf.ips)
  sshCommand(ips, Presets.clean())

  debug('Setup browsers')
  sshCommand(
    browserConf.ips,
    [browserConf.env, ...Presets.launchBrowser(logName)]
  )

  debug('Setup clients')
  sshCommand(
    clientConf.ips,
    [clientConf.env, ...clientConf.launcher]
  )

  debug('Waiting...')
  sleep(WAIT)

  debug('Final process')
  sshCommand(ips, Presets.clean())

  debug('--- Result ----')
  let allIps = [].concat(Ip.APP, ips)
  sshCommand(allIps, ['ps aux | grep node'])
  sshCommand(allIps, [`du log/${logName}`])
  sshCommand(allIps, [`tail log/${logName}`])
  console.log('\n')
}

function execute () {
  // disReport
  {
    let browsersSet = [1, 10, 50, 100, 150, 200, 500]
    let reportPerSecSet = [1, 10, 20, 30, 40, 50, 100]
    for (let browsers of browsersSet) {
      for (let reportPerSec of reportPerSecSet) {
        try {
          experimentDisReport({ browsers, reportPerSec })
        } catch (e) {
          console.error(e)
          continue
        }
      }
    }
  }
  // conReport
  {
    let browsersSet = [1, 10, 50, 100, 150, 200, 500]
    let reportsSet = [100, 200, 500, 1000, 2000, 5000]
    for (let browsers of browsersSet) {
      for (let reporters of reportsSet) {
        try {
          experimentConReport({ browsers, reporters })
        } catch (e) {
          console.error(e)
          continue
        }
      }
    }
  }
  // upload
  {
    let browsersSet = [1]
    let postsSet = [1, 10, 20, 50, 100]
    let sizeSet = ['320x180', '1280x720', '1920x1080', '4096x2160']
    for (let browsers of browsersSet) {
      for (let postPerSecond of postsSet) {
        for (let imgSize of sizeSet) {
          try {
            experimentUpload({ browsers, postPerSecond, imgSize })
          } catch (e) {
            console.error(e)
            continue
          }
        }
      }
    }
  }
}

execute()
