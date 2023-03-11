const Lexer = require('./Lexer')
const { TokenType } = require('./TokenType')

const kBlockSize = 32767

const kBuiltInTypes = {
  css: {
    quoteChars: '"',
    startDelimited: '/*',
    startDelimitedSpecial: '/*!',
    endDelimited: '*/',
    startLine: '',
    regex: false,
  },
  html: {
    quoteChars: '',
    startDelimited: '<!--',
    startDelimitedSpecial: '<!--!',
    endDelimited: '-->',
    startLine: '',
    regex: false,
  },
  js: {
    quoteChars: '"\'`',
    startDelimited: '/*',
    startDelimitedSpecial: '/*!',
    endDelimited: '*/',
    startLine: '//',
    regex: true,
  },
}

const kBuiltInAliases = {
  htm: 'html',
  less: 'css',
  ts: 'ts',
}

const kDefaultOptions = {
  delimited: true,
  delimitedLines: true,
  special: false,
  specialLines: false,
  line: true,
  lineEnd: true,
}

const kDefaultLanguage = 'js'

/**
  * @class DeleteComments
  * @description Given a text string, deletes spans of text that represent different kinds of comments.
  * @return {string} - The input text with the comments removed.
  */
class DeleteComments {
  static defaultOptions () {
    return kDefaultOptions
  }

  _processOptions (options) {
    // Add types specified by caller
    if (options.types) {
      options.types = { ...kBuiltInTypes, ...options.types }
    }
    else {
      options.types = { ...kBuiltInTypes }
    }

    // Get aliases for all types
    let aliases = { ...kBuiltInAliases }
    Object.keys(options.types).forEach((k) => { aliases[k] = k })

    // Add aliases specified by caller
    if (options.aliases) {
      aliases = { ...aliases, ...options.aliases }
    }
    options.aliases = aliases

    return options
  }

  delete (s, options) {
    options = { ...kDefaultOptions, ...options }
    const opts = this._processOptions(options)
    const properties = opts.types[opts.aliases[opts.language || kDefaultLanguage]]

    const removeSpan = {
      [TokenType.TEXT]: false,
      [TokenType.DELIMITED]: opts.delimited,
      [TokenType.DELIMITED_LINES]: opts.delimitedLines,
      [TokenType.DELIMITED_SPECIAL]: opts.special,
      [TokenType.DELIMITED_SPECIAL_LINES]: opts.specialLines,
      [TokenType.LINE_END]: opts.lineEnd,
      [TokenType.WHOLE_LINE]: opts.line,
    }

    let out = ''
    let block = ''
    const lex = new Lexer(s, properties)
    while (!lex.eof) {
      const span = lex.getNextSpan()
      if (!removeSpan[span.type]) {
        block += span.toString(s)
        if (block.length > kBlockSize) {
          out += block
          block = ''
        }
      }
    }

    out += block
    return out
  }
}

module.exports = DeleteComments
