/**
 * @function grunt-expected-files
 * @description Updates the "deleteComments" configuration during grunt to create files
 * in the tmp folder which will be compared to files in the test/expected folder
 */
module.exports = function (grunt) {
  // Used to extract file extension
  const extRe = /\.([^.]+$)/

  // Default input file by filetype
  const inputs = {
    css: 'styles.css',
    html: 'index.html',
    js: 'script.js',
  }

  // Pre-defined configuration options
  const optionSets = {
    all: {
      delimited: true,
      delimitedLines: true,
      special: true,
      specialLines: true,
      line: true,
      lineEnd: true,
    },
    defaults: {},
  }

  // Extract the first group of the specific RegEx from s
  const extract = function (s, re) {
    const matches = re.exec(s)
    if (matches !== null) {
      return matches.slice(1)
    }
    return []
  }

  // Add a configuration target based on the name of the given file
  const addToConfig = function (filename) {
    // Add configuration tasks derived from "expected" folder files
    const [ext] = extract(filename.toLowerCase(), extRe)

    // Filename determines the options
    let optionNames = filename.replace(extRe, '').toLowerCase()
    if (optionNames.indexOf('-') !== -1) {
      optionNames = optionNames.replace(/^[^-]*-/, '')
    }

    let opts = {}
    if (optionSets[optionNames]) {
      // Filename maps to configuration
      opts = { ...optionSets[optionNames] }
    }
    else {
      // Filename substrings trigger option properties
      opts.delimited = /\bdelimited\b/.test(optionNames)
      opts.delimitedLines = /\bdelimitedlines\b/.test(optionNames)
      opts.special = /\bspecial\b/.test(optionNames)
      opts.specialLines = /\bspeciallines\b/.test(optionNames)
      opts.line = /\bline\b/.test(optionNames)
      opts.lineEnd = /\blineend\b/.test(optionNames)
    }
    opts.language = ext

    let input = inputs[ext]
    const customTemplate = filename
    if (grunt.file.exists('test/fixtures/' + customTemplate)) {
      grunt.verbose.writeln('Using custom template: ' + customTemplate)
      input = customTemplate
    }

    const key = filename.replace(/[ .]/g, '_')
    comments[key] = {
      options: opts,
      src: 'test/fixtures/' + input,
      dest: 'tmp/' + filename,
    }
  }

  // Get "baseline" configuration
  const comments = grunt.config.data.delete_comments

  grunt.file.recurse('test/expected', (absDir, rootDir, subDir, filename) => {
    if (subDir) return
    addToConfig(filename)
  })

  // Apply our additions to configuration
  grunt.config.data.delete_comments = comments
  grunt.verbose.writeln('delete_comments: ' + JSON.stringify(comments, null, 2))
}
