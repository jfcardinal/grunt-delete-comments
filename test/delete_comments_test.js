"use strict";

/* global it, describe */

if (assert == null) { // eslint-disable-line no-use-before-define
  var assert = require('assert') // eslint-disable-line no-var
}

const grunt = require('grunt');
const DeleteComments = require('../tasks/lib/DeleteComments');

const eolRe = /(?:\r\n|\r|\n)/g
function normalizeEol (s) {
  return s.replace(eolRe, '\n')
}

const kHasEverything = `/** Foo */
function add(x, y) /* inline */{ return x + y }

// Another function
function subtract(x, y) { return x - y }
`

const optionsAllOff = {
  delimited: false,
  delimitedLines: false,
  special: false,
  specialLines: false,
  line: false,
  lineEnd: false,
}

const optionsAllOn = {
  delimited: true,
  delimitedLines: true,
  special: true,
  specialLines: true,
  line: true,
  lineEnd: true,
}

function fileCompareIt (pathToExpected, subDir, filename) {
  it(subDir ? subDir + '/' + filename : filename, () => {
    const pathToActual = 'tmp/' + (subDir ? subDir + '/' : '') + filename;
    let actual = grunt.file.read(pathToActual);
    actual = normalizeEol(actual)

    let expected = grunt.file.read(pathToExpected);
    expected = normalizeEol(expected)

    const msg = 'Actual output ("' + pathToActual + '") does not  match ' +
       'expected output ("' + pathToExpected + '"):' 
    assert(actual === expected, msg)
  })
}

function deleteComments (input, options) {
  const rc = new DeleteComments()
  return rc.delete(input, options)
}

describe('Standalone', () => {
  it('Remove delimited lines only', () => {
    const expected = `function add(x, y) /* inline */{ return x + y }

// Another function
function subtract(x, y) { return x - y }
`
    const options = { ...optionsAllOff, ...{ delimitedLines: true } }
    const actual = deleteComments(kHasEverything, options)
    if (actual !== expected) {
      console.log('expected:\n' + expected)
      console.log('actual:\n' + actual)
    }
    assert.equal(actual, expected, 'Not equal')
  })

  it('Remove delimited inline only', () => {
    const expected = `/** Foo */
function add(x, y) { return x + y }

// Another function
function subtract(x, y) { return x - y }
`
    const options = { ...optionsAllOff, ...{ delimited: true } }
    const actual = deleteComments(kHasEverything, options)
    if (actual !== expected) {
      console.log('expected:\n' + expected)
      console.log('actual:\n' + actual)
    }
    assert.equal(actual, expected, 'Not equal')
  })

  it('Do not remove comments inside quoted strings', () => {
    const input = '/* remove */ console.log("/* */") // Remove'
    const expected = ' console.log("/* */")'
    const actual = deleteComments(input, {})
    assert.equal(actual, expected, 'Not equal')
  })

  it('Remove comments before and after RegEx with character class', () => {
    const input = '/* remove */ const re = /(["\']+)/g // Remove'
    const expected = ' const re = /(["\']+)/g'
    const actual = deleteComments(input, {})
    assert.equal(actual, expected, 'Not equal')
  })

  it('Detect RegEx after "!" operator', () => {
    const input = 'if (!/\\/search_queries\\//i.test(window.location.href)) return false // Comment'
    const expected = 'if (!/\\/search_queries\\//i.test(window.location.href)) return false'
    const actual = deleteComments(input, {})
    assert.equal(actual, expected, 'Not equal')
  })

  it('Detect RegEx in return statement', () => {
    const input = 'return /[abc]/.text(s) // Comment'
    const expected = 'return /[abc]/.text(s)'
    const actual = deleteComments(input, {})
    assert.equal(actual, expected, 'Not equal')
  })
})

describe('Grunt Single Files', () => {
  grunt.file.recurse('test/expected', (absDir, rootDir, subDir, filename) => {
    if (subDir) return
    const pathToExpected = rootDir + '/' + filename
    fileCompareIt(pathToExpected, '', filename)
  });
})

describe('Grunt Folder', () => {
  grunt.file.recurse('test/expected/multiple', (absDir, rootDir, subDir, filename) => {
    const pathToExpected = rootDir + '/' + filename
    fileCompareIt(pathToExpected, 'multiple', filename)
  });
})


