/**
  * @object TokenType
  * @description Constant values that represents the types of text tokens or spans of interest
  * to the Lexer.
  */
const TokenType = {
  // Where token is not one of the other types
  TEXT: 0,

  // Where /* IS NOT the first non-tab, non-space on a line
  DELIMITED: 1,

  // Where /* IS the first non-tab, non-space on a line
  DELIMITED_LINES: 2,

  // Where /*! IS NOT the first non-tab, non-space on a line
  DELIMITED_SPECIAL: 3,

  // Where /*! IS the first non-tab, non-space on a line
  DELIMITED_SPECIAL_LINES: 4,

  // Where // IS NOT the first non-tab, non-space on a line
  LINE_END: 5,

  // Where // IS the first non-tab, non-space on a line
  WHOLE_LINE: 6,

  // Token with only space or tab characters
  SPACE_TAB: 7,

  // Token with only \r or \n characters. Only three variations
  // possible: \r\n, \r, or \n. Maximum length = 2.
  NEWLINE: 8,

  // Token is quote character
  QUOTE: 9,

  // Token with characters that indicate the start of a comment
  // in the current language
  COMMENT_START: 10,
}

/**
  * @object names
  * @description Text names for the numeric TokenTypes.
  */
const names = [
  'Text',
  'Delimited',
  'Delimited Line(s)',
  'Delimited-Special',
  'Delimited-Special Line(s)',
  'End-of-Line',
  'Whole Line',
  'Space(s) Tab(s)',
  'NewLine',
  'Quoted String',
  'Comment Start',
]

/**
  * @obfunction TokenTypeToString
  * @description Converts a numeric TokenType to a string.
  * @param {TokenType} type - The TokenType.
   * @return {Token} - Returns the name of the gien TokenType.
  */
function TokenTypeToString (type) {
  return names[type] || 'ERROR!'
}

module.exports = { TokenType, TokenTypeToString }
