/**
 * This file has multiple kinds of comments.
 * It is used by multiple tests.
 */
/*!
 * This is important work we do, Horatio.
 */

// Line comment
function f1 (a, b) {
  return a + b // return the sum of a + b
}

// Commented-out code
function f2 (hack) {
  /* old method
  return= hack.replace('b', 'a')
  */
  // new method
  return hack.replace('a', 'b')
}

/**/
let foo = 10
/*!*/

/* Multiline followed by text after the ending delimiter
 */ foo = 20

module.exports = { f1, f2, foo }
// A trailing comment, just for fun
