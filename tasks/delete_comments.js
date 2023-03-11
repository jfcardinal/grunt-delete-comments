/*
 * grunt-delete-comments
 * https://github.com/JohnCardinal/grunt-delete-comments
 *
 * Copyright (c) 2023 John Cardinal
 * Licensed under the MIT license.
 */

/**
  * @function deleteComments
  * @description Removes various comment types from JavaScript, CSS, and HTML files.
  */
module.exports = function (grunt) {
  const DeleteComments = require('./lib/DeleteComments')

  const extRe = /\.([^.]+$)/
  const extract = function (s, re) {
    const matches = re.exec(s)
    if (matches !== null) {
      return matches.slice(1)
    }
    return []
  }

  grunt.registerMultiTask(
    'delete_comments',
    'Remove comments from JavaScript, CSS, HTML, and other file types',
    function () {
      let options = this.options({})
      options = { ...DeleteComments.defaultOptions(), ...options }

      this.files.forEach(function (file) {
        file.src.filter(function (filepath) {
          if (!grunt.file.exists(filepath)) {
            grunt.log.warn('Source file "' + filepath + '"" not found')
            return false
          }

          const opts = { ...options }
          const [ext] = extract(filepath.toLowerCase(), extRe)
          if (!opts.language) opts.language = ext

          let contents = grunt.file.read(filepath)
          const rc = new DeleteComments()
          contents = rc.delete(contents, opts)

          const dest = file.dest ? file.dest : filepath
          grunt.file.write(dest, contents)
          grunt.log.writeln((file.dest ? 'Created "' : 'Updated "') + dest + '"')

          return true
        })
      })
    })
}
