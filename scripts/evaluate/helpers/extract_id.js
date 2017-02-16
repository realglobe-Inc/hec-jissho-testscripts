/**
 * ログ行 logBody を入れた時に、 test に合格した行について、 matcher にマッチする部分を返す
 */
const factory = ({test, matcher}) => (logBody) => {
  if (test.test(logBody)) {
    let match = matcher.match(logBody)
    return match[1]
  } else {
    return false
  }
}

const reportPattern = /qq:reporter:([0-9#]+)/
const photoPattern = /(\w+-\w+-\w+-\w+-\w+)/

/**
 * 各実験パターンにおいてログ行を入れたら id 情報を適切に取ってくる関数たち
 */
const ExtractId = {
  App: {
    report: factory({
      test: /Observer\srecieve\sreport/,
      matcher: reportPattern
    }),
    upload: factory({
      test: /INSERT\sINTO\s`photo`/,
      matcher: photoPattern
    })
  },
  Client: {
    report: factory({
      test: /REPORT_FULL_ID=/,
      matcher: reportPattern
    }),
    upload: factory({
      test: /hec:rest:upload\sPhoto\suploaded/,
      matcher: photoPattern
    })
  },
  Browser: {
    report: {
      test: /CONSOLE\sREPORT:/,
      matcher: reportPattern
    },
    upload: {
      test: /CONSOLE\sPHOTO:/,
      matcher: photoPattern
    }
  }
}

module.exports = ExtractId
