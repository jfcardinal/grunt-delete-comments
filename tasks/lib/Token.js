/**
  * @class Token
  * @description Describes a span of characters in the current input.
  * @remarks Does not store a copy of the text. Instead, it keeps offsets into the source
  * the caller is processing.
  */
class Token {
  constructor (type, start, end) {
    this._type = type
    this._start = start
    this._end = end
  }

  get end () { return this._end }
  get length () { return this._end - this._start + 1 }
  get start () { return this._start }
  get type () { return this._type }

  toString (s) {
    return s.substring(this._start, this._end + 1)
  }
}

module.exports = Token
