/**
 * ログ行 logBody を入れた時に、 head から始まっている行に反応して、 reg にマッチする部分を返す
 */
const factory = ({head, reg}) => (logBody) => {
  if (logBody.startsWith(head)) {
    let match = logBody.match(reg)
    return match[1]
  } else {
    return false
  }
}

const ExtractId = {
  App: {
    report: factory({
      head: 'hec:report-observer Observer recieve report',
      reg: /(qq:reporter:[0-9#]+)/
    }),
    upload: factory({
      head: 'hec:db Executing (default): INSERT INTO `photo`',
      reg: /\/([0-9a-z-]+)\.jpg/
    })
  },
  Client: {
    report: factory({
      head: 'hec:test:reporter REPORT_FULL_ID=',
      reg: /REPORT_FULL_ID=(qq:reporter:[0-9#]+)/
    }),
    upload: factory({
      head: 'ec:rest:upload Photo uploaded',
      reg: /(\w+-\w+-\w+-\w+-\w+)/
    })
  },
  Browser: {
    // TODO 実装
    report: {
      head: '',
      reg: /a/
    },
    upload: {
      head: '',
      reg: /a/
    }
  }
}

module.exports = ExtractId
