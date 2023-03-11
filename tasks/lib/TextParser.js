const NullChar = '\0'

class TextParser {
  constructor (text) {
    this._text = text
    this._pos = 0
  }

  get eof () { return this._pos >= this._text.length }
  get length () { return this._text.length }
  get remaining () { return this._text.length - this._pos }
  get text () { return this._text }

  get position () { return this._pos }
  set position (value) { this._pos = value }

  charAt (index) {
    if (index < this._text.length) return this._text[index]
    return NullChar
  }

  isMatchAt (s) {
    let index = this._pos
    if (!s?.length || (index + s.length) > this._text.length) return false
    for (let i = 0; i < s.length; i++) {
      if (s.charAt(i) !== this._text.charAt(index++)) return false
    }
    return true
  }

  moveAhead (ahead) {
    ahead = ahead || 1
    this._pos = Math.min(this._pos + ahead, this._text.length)
  }

  moveTo (index) {
    if (index >= 0) {
      this._pos = Math.min(index, this._text.length)
    }
  }

  moveToString (s) {
    const index = this._pos
    if (!s?.length || (index + s.length) > this._text.length) {
      this._pos = this._text.length
      return false
    }

    const ct = s.charAt(0)
    while (!this.eof) {
      const c = this.peek()
      if (c === ct) {
        if (this.isMatchAt(s)) return true
      }
      this.moveAhead()
    }
    return false
  }

  peek (ahead) {
    const index = ahead ? this._pos + ahead : this._pos
    if (index < this._text.length) return this._text.charAt(index)
    return NullChar
  }

  substring (start, end) {
    if (start >= this._text.length) return ''
    return this._text.substring(start, end)
  }
}

module.exports = { TextParser, NullChar }
