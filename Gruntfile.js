/*
 * grunt-delete-comments
 * https://github.com/jfcardinal/grunt-delete-comments
 *
 * Copyright (c) 2023 John Cardinal
 * Licensed under the MIT license.
 */
module.exports = function (grunt) {
  const gruntExpectedFiles = require('./task-for-testing/grunt-expected-files.js')

  grunt.initConfig({
    clean: {
      tests: ['tmp']
    },

    delete_comments: {
      multipleFiles: {
        expand: true,
        cwd: 'test/fixtures/multiple',
        src: '*.*',
        dest: 'tmp/multiple/',
        filter: 'isFile',
        options: {
          aliases: {
            mycss: 'css',
          },
        },
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          captureFile: 'tmp/results.txt',
        },
        src: ['test/*.js']
      }
    },
  })

  grunt.loadTasks('tasks') // Load our plug-in
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-mocha-test')

  grunt.registerTask('cleanup', ['clean'])
  grunt.registerTask('expected', 'Update comments configuration for test/expected folder files',
    () => { gruntExpectedFiles(grunt) });
  grunt.registerTask('mocha', ['mochaTest'])

  grunt.registerTask('default', ['expected', 'clean', 'delete_comments', 'mochaTest'])
};
