const { TextParser } = require('./TextParser')
const Token = require('./Token')
const { TokenType, TokenTypeToString } = require('./TokenType')

class Lexer {
  constructor (text, properties) {
    this._tp = new TextParser(text)
    this._text = text
    this._afterNewLine = true
    this._queue = []

    this._startDelimited = properties.startDelimited
    this._startDelimitedSpecial = properties.startDelimitedSpecial
    this._endDelimited = properties.endDelimited
    this._startLine = properties.startLine
    this._regex = properties.regex

    this._charClass = []
    this._addCharClass(' \t', TokenType.SPACE_TAB)
    this._addCharClass('\r\n', TokenType.NEWLINE)
    this._addCharClass(properties.startDelimited.charAt(0), TokenType.COMMENT_START)
    this._addCharClass(properties.startDelimitedSpecial.charAt(0), TokenType.COMMENT_START)
    this._addCharClass(properties.startLine.charAt(0), TokenType.COMMENT_START)
    this._addCharClass(properties.quoteChars, TokenType.QUOTE)

    this._reIndexes = this._getReIndexes()
  }

  _addCharClass (s, type) {
    if (!s) return
    for (let i = 0; i < s.length; i++) {
      this._charClass[s.charCodeAt(i)] = type
    }
  }

  /**
   * @property eof
   * @description Returns true when there is no more input.
   * @return {boolean} - Returns true when there are no more characters to process.
   */
  get eof () { return this._tp.eof }

  /**
   * @function showTokens
   * @return {string} - Returns a description of the tokens parsed from the input starting from
   * the current position.
   */
  showTokens () {
    let result = ''
    const tp = this._tp
    const savePos = tp.position
    while (true) {
      const tokPos = tp.position
      const tok = this.getNextSpan()
      if (!tok) break
      const text = this._encodeControls(tok.toString(this._text))
      result += `Token@${tokPos} (${TokenTypeToString(tok.type)}) = "${text}"\n`
    }
    tp.position = savePos
    return result
  }

  /**
   * @function _encodeControls
   * @description Change '\t', '\r', and '\n' characters to visible strings, i.e., '\\t' for '\t'.
   * @param {string} s - The input string.
   * @return {string} - Returns the input string with the control characters changed to visible text.
   */
  _encodeControls (s) {
    return s.toString(this._text).replace(/[\t\r\n]/g, (m) => {
      const cp = '\t\r\n'.indexOf(m.charAt(0))
      return '\\' + 'trn'.charAt(cp)
    })
  }

  /**
   * @function getNextSpan
   * @description Returns a Token that represents a logical span of text.
   * @return {Token} - Returns the token that defines the next span of text.
   */
  getNextSpan () {
    if (this._queue.length > 0) {
      const tok = this._queue.shift()
      return tok
    }

    const tp = this._tp
    let lastToken = null

    while (!tp.eof) {
      let token = this._getToken()
      if (!token) return lastToken

      const lineType = token.type === TokenType.DELIMITED ? TokenType.DELIMITED_LINES : TokenType.DELIMITED_SPECIAL_LINES

      switch (token.type) {
        case TokenType.DELIMITED:
        case TokenType.DELIMITED_SPECIAL:
          if (this._afterNewLine) {
            this._afterNewLine = false
            token = this._takeNewLine(token)
            if (lastToken?.type === TokenType.SPACE_TAB) {
              return new Token(lineType, lastToken.start, token.end)
            }
            else {
              return new Token(lineType, token.start, token.end)
            }
          }
          if (lastToken?.type === TokenType.SPACE_TAB) {
            this._queue.push(token)
            return lastToken
          }
          return token

        case TokenType.LINE_END:
          if (lastToken?.type === TokenType.SPACE_TAB) {
            token = new Token(TokenType.LINE_END, lastToken.start, token.end)
          }
          if (this._afterNewLine) {
            this._afterNewLine = false
            token = this._takeNewLine(token)
            token = new Token(TokenType.WHOLE_LINE, token.start, token.end)
          }
          return token

        case TokenType.NEWLINE:
          this._afterNewLine = true
          if (lastToken?.type === TokenType.SPACE_TAB) {
            token = new Token(TokenType.LINE_END, lastToken.start, token.end)
          }
          return token

        case TokenType.SPACE_TAB:
          if (lastToken?.type === TokenType.SPACE_TAB) {
            token = new Token(TokenType.SPACE_TAB, lastToken.start, token.end)
          }
          lastToken = token
          break

        default:
          this._afterNewLine = false
          if (lastToken?.type === TokenType.SPACE_TAB) {
            token = new Token(token.type, lastToken.start, token.end)
          }
          return token
      }
    }
  }

  /**
  * @function _takeNewLine
  * @description If the next text is a newline sequence, adds the newline to the given token.
  */
  _takeNewLine (token) {
    const tp = this._tp
    if (tp.peek() === '\r' && tp.peek(1) === '\n') {
      tp.moveAhead(2)
      this._afterNewLine = true
      return new Token(token.type, token.start, tp.position - 1)
    }
    if (tp.peek() === '\r' || tp.peek() === '\n') {
      this._afterNewLine = true
      tp.moveAhead(1)
      return new Token(token.type, token.start, tp.position - 1)
    }
    return token
  }

  /**
   * @function _getToken
   * @description Returns a Token that represents a range of characters of interest to the parser.
   * @return {Token} - Returns the token that defines the next span of text.
   */
  _getToken () {
    const tp = this._tp
    const start = tp.position
    while (!tp.eof) {
      const c = tp.peek()
      const charType = this._charClass[c.charCodeAt(0)]
      if (charType === undefined) {
        tp.moveAhead()
        continue
      }

      if (c === '/' && this._regex && this._isRegExStart(tp.position)) {
        this._skipRegEx()
        continue
      }

      if (charType === TokenType.QUOTE) {
        this._skipQuotedString(c)
        continue
      }

      if (c === ' ' && tp.position !== start) {
        // Avoid creating a space token if the next character is a text character.
        const c1 = tp.peek(1)
        if (this._charClass[c1.charCodeAt(0)] === undefined) {
          tp.moveAhead()
          continue
        }
      }

      if (tp.position !== start) {
        return new Token(TokenType.TEXT, start, tp.position - 1)
      }

      // Get a token implied by the charType.
      switch (charType) {
        case TokenType.COMMENT_START: {
          const commentToken = this._getCommentToken()
          if (commentToken) return commentToken
          break
        }

        case TokenType.NEWLINE:
          return this._getEolToken()

        case TokenType.SPACE_TAB: {
          const spaceTab = this._getSpaceTabToken()
          if (spaceTab) return spaceTab
          break
        }
      }
      tp.moveAhead()
    }

    if (tp.position !== start) {
      return new Token(TokenType.TEXT, start, tp.position - 1)
    }
  }

  /**
   * @function _getCommentToken
   * @description If the next text defines a comment in the current language, returns the text of the comment.
   * Otherwise, returns null.
   * @return {Token} - Returns the token that defines the comment text or null.
   */
  _getCommentToken () {
    const tp = this._tp
    const start = tp.position

    if (tp.isMatchAt(this._startLine)) {
      tp.moveAhead(this._startLine.length)
      while (!tp.eof) {
        const c = tp.peek()
        if (c === '\r' || c === '\n') break
        tp.moveAhead()
      }
      return new Token(TokenType.LINE_END, start, tp.position - 1)
    }
    if (tp.isMatchAt(this._startDelimitedSpecial)) {
      tp.moveAhead(this._startDelimitedSpecial.length)
      if (tp.moveToString(this._endDelimited)) {
        tp.moveAhead(this._endDelimited.length)
      }
      return new Token(TokenType.DELIMITED_SPECIAL, start, tp.position - 1)
    }
    if (tp.isMatchAt(this._startDelimited)) {
      tp.moveAhead(this._startDelimited.length)
      if (tp.moveToString(this._endDelimited)) {
        tp.moveAhead(this._endDelimited.length)
      }
      return new Token(TokenType.DELIMITED, start, tp.position - 1)
    }
  }

  /**
   * @function _getEolToken
   * @description Given the current character is a newline character (either \r or \n), returns
   * a Token. The Token will include a one- or two-character value. "\r\n", "\r", or "\n".
   * @return {Token} - Returns the token that defines the newline text.
   */
  _getEolToken () {
    const tp = this._tp
    const start = tp.position
    if (tp.peek() === '\r') {
      if (tp.peek(1) === '\n') {
        tp.moveAhead()
      }
    }
    tp.moveAhead()
    return new Token(TokenType.NEWLINE, start, tp.position - 1)
  }

  /**
   * @function _getSpaceTabToken
   * @description Given the current character is a space or a tab ("\t"), returns a Token that
   * includes all the space or tabe characters that form a span.
   * @return {Token} - Returns the token that defines the combined spaces and tabs.
   */
  _getSpaceTabToken () {
    const tp = this._tp
    const start = tp.position
    tp.moveAhead()
    while (!tp.eof) {
      const c = tp.peek()
      if (c !== ' ' && c !== '\t') break
      tp.moveAhead()
    }
    return new Token(TokenType.SPACE_TAB, start, tp.position - 1)
  }

  /**
   * @function _skipQuotedString
   * @description Moves the TextParser's character position ahead to the matching quote character that
   * matches the input parameter.
   * @param {string} endQ - The first character of the string parameter determines the ending quote character.
   */
  _skipQuotedString (endQ) {
    // quoted string ends at matching quote or at newline for " or '

    const tp = this._tp
    tp.moveAhead()
    while (!tp.eof) {
      const c = tp.peek()

      if (c === '\\') {
        tp.moveAhead(2)
        continue
      }

      tp.moveAhead()
      if (c === endQ || (endQ !== '`' && (c === '\r' || c === '\n'))) {
        return
      }
    }
  }

  /**
   * @function _getReIndexes
   * @description Returns an array of the offsets into the text where there are Regular Expression literals.
   * @return {array} - Returns the array of offsets.
   */
  _getReIndexes () {
    const reIndex = []
    if (!this._regex) return reIndex

    const re = /(?:^|[=,:(][ \t]*)\/(?:(?![*+?])(?:[^\r\n[/\\]|\\.|\[(?:[^\r\n\]\\]|\\.)*\])+)\/(?:(?:g(?:im?|mi?)?|i(?:gm?|mg?)?|m(?:gi?|ig?)?)?)/gm
    const matches = this._text.matchAll(re)
    for (const match of matches) {
      let index = match.index
      while (this._text.charAt(index) !== '/') index++
      reIndex[index] = 1
    }

    return reIndex
  }

  /**
   * @function _isRegExStart
   * @description Determines if the character at the given index into the input text is the starting
   * delimiter character ("/") of a RegEx literal.
   * @param {number} index - The index for which
   * @return {boolean} - Returns true if the given index is the starting delimiter character ("/") of a RegEx literal.
   */
  _isRegExStart (index) {
    return this._reIndexes[index]
  }

  /**
   * @function _skipRegEx
   * @description Moves the TextParser's character position ahead to the matching '/' character that
   * ends the RegEx literal.
   */
  _skipRegEx () {
    const tp = this._tp

    // move to start of RE
    while (!tp.eof) {
      if (tp.peek() === '/') break
      tp.moveAhead()
    }

    // move to end of RE
    let inCC = false
    tp.moveAhead()
    while (!tp.eof) {
      const c = tp.peek()
      if (c === '\\') {
        tp.moveAhead(2)
        continue
      }
      if (c === '[') {
        inCC = true
        continue
      }
      if (c === ']') {
        inCC = false
        continue
      }
      tp.moveAhead()
      if (!inCC && tp.peek() === '/') break
    }
  }
}

module.exports = Lexer
