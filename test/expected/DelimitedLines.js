/*!
 * This is important work we do, Horatio.
 */

// Line comment
function f1 (a, b) {
  return a + b // return the sum of a + b
}

// Commented-out code
function f2 (hack) {
  // new method
  return hack.replace('a', 'b')
}

let foo = 10
/*!*/

 foo = 20

module.exports = { f1, f2, foo }
// A trailing comment, just for fun
