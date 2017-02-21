/**
 * ログ行 logBody を入れた時に、 test に合格した行について、 matcher にマッチする部分を返す
 */
const extractor = ({test, matcher}) => (logBody = '') => {
  if (test.test(logBody)) {
    let match = matcher.exec(logBody)
    return match[1]
  } else {
    return false
  }
}

const extractUpload = (logBody = '') => {
  if (/hec:rest:upload\sUpload\sID=/.test(logBody)) {
    let id = /\sID=([0-9a-z.]+)/.exec(logBody)[1]
    return {
      state: 'start',
      id
    }
  }
  if (/hec:rest:upload\sUploaded\sID=/.test(logBody)) {
    let id = /\sID=([0-9a-z.]+)/.exec(logBody)[1]
    return {
      state: 'finish',
      id
    }
  }
  return false
}

const reportPattern = /qq:reporter:([0-9#]+)/
const photoPattern = /(\w+-\w+-\w+-\w+-\w+)/

/**
 * 各実験パターンにおいてログ行を入れたら id 情報を適切に取ってくる関数たち
 */
const IdExtractor = {
  app: {
    report: extractor({
      test: /Observer\srecieve\sreport/,
      matcher: reportPattern
    })
    // upload: extractor({
    //   test: /INSERT\sINTO\s`photo`/,
    //   matcher: photoPattern
    // })
  },
  client: {
    report: extractor({
      test: /REPORT_FULL_ID=/,
      matcher: reportPattern
    }),
    upload: extractUpload
  },
  browser: {
    report: extractor({
      test: /CONSOLE\sREPORT:/,
      matcher: reportPattern
    })
    // upload: extractor({
    //   test: /CONSOLE\sPHOTO:/,
    //   matcher: photoPattern
    // })
  }
}

module.exports = IdExtractor
