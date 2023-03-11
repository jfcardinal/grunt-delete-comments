
function f1 (a, b) {
  return a + b
}

function f2 (hack) {
  return hack.replace('a', 'b')
}

let foo = 10

 foo = 20

module.exports = { f1, f2, foo }
