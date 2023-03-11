<!--!
grunt-delete-comments
https://github.com/jfcardinal/grunt-delete-comments

Copyright (c) 2023 John Cardinal
Licensed under the MIT license.
-->

# grunt-delete-comments

> Remove comments from JavaScript, CSS, HTML, and other files

## Overview

This plugin can be configured to remove various types of comments from source files. It is intended for use with Javascript (.js, .ts) files, CSS files (.css, .less), and HTML files (.html, .htm). 

You may also configure it to work with other languages that have unique characters to start multiple line and single line comments.

```js
/*
 * It will remove this comment.
 */
// And it will remove this comment.
const foo /* and this one, too */ = 100
```

For more details regarding which comments may be removed, see the [Options](#Options) section.


## Getting Started
This plugin requires Grunt `1.6.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-delete-comments --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-delete-comments');
```

## The "delete_comments" task

In your project's Gruntfile, add a section named `delete_comments` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  delete_comments: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file specifications and/or options go here.
    },
  },
});
```


In your project's [Gruntfile](https://gruntjs.com/sample-gruntfile), load the task:

```js
grunt.loadNpmTasks('grunt-delete-comments');
```

Then add a section named `delete_comments` and include one or more [targets](https://gruntjs.com/configuring-tasks#task-configuration-and-targets).

### Example One

```js
grunt.initConfig({
  delete_comments: {
    // Target name is arbitrary.
    theTarget: {
      cwd: 'src',
      src: ['**.js'],
      dest: 'dist/',
    },
  },
});
```

### Example Two

```js
grunt.initConfig({
  delete_comments: {
    // Target name is arbitrary.
    theTarget: {
      // You may specify options. The following are default values.
      options: {
          delimited: true,
          delimitedLines: true,
          special: false,
          specialLines: false,
          line: true,
          lineEnd: false,
      },
      src: ['dist/*.js']
      // If you omit `dest`, files are updated in-place.
    },
  },
});
```

Typically, you will add the delete_comments task to one or more other registered tasks.

For example, here is the tasks section of a Gruntfile where the default task copies some files and then removes comments from some of the files specified in the target(s):

```js
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-delete-comments');

grunt.registerTask('default', ['copy', 'delete_comments']);
```

### Comment Types

grunt-delete-comments divides comments into these categories:

- [delimited](#delimited)
- [delimitedLines](#delimitedLines)
- [lineEnd](#lineEnd)
- [line](#line)
- [special](#special)
- [specialLines](#specialLines)

#### delimited

*delimited* comments are marked by starting and ending character sequences.

In JavaScript and CSS, the starting delimiter is `/*` and the ending delimiter is `*/`. In HTML, the starting delimiter is `<!--` and the ending delimiter is `-->`.

In the following example, a delimited comment is used to comment-out an alternative value for the assignment statement: `/* 10 */`

````js
const foo = /* 10 */ 11;
````

#### delimitedLines

When a delimited comment is the first non-space, non-tab text on a line, it is a *delimitedLines* comment. These are typically used for comments that apply to a major section of code, such as a class, method, etc.

````js
/**
 * @class Token
 * @description Describes a span of characters in the current input.
 */
````

Whether a comment is considered a *delimited* comment or a *delimitedLines* comment is determined by the position of the starting delimiter.

- If the starting delimiter is *not* the first non-space, non-tab character(s) on a line, the comment is a delimited comment.

- If the starting delimiter is the first non-space, non-tab character(s) on a line, the comment is a delimitedLines comment.

#### lineEnd

*lineEnd* comments are marked by a starting character sequence only. They end at the end of the current line.

In JavaScript, the starting delimiter is `//`. HTML and CSS do not have lineEnd comments.

```js
let lang = opts.lang || 'js' // Get caller language or default
````

#### line

When a line comment is the first non-space, non-tab text on a line, it is a *line* comment. These are typically used for comments that apply to the next line of code, or the next short section of code.

```js
// Get caller language or default
let lang = opts.lang || 'js'
````

Whether a comment is considered a *lineEnd* comment or a *line* comment is determined by the position of the starting delimiter.

- If the starting delimiter is *not* the first non-space, non-tab character(s) on a line, the comment is a *lineEnd* comment.

- If the starting delimiter is the first non-space, non-tab character(s) on a line, the comment is a *line* comment.

#### special

*special* comments are marked by starting and ending character sequences. They are typically variations of a **delimited** comment where the starting sequence has an extra character to indicate important commentary that should be treated differently from normal comments. The extra character is determined by convention, not a language syntax rule.

In JavaScript, the starting delimiter is `/*!`.

````js
const foo = /*! 10 (triggers a bug) */ 11;
````

#### specialLines

When a special comment is the first non-space, non-tab text on a line, it is considered a **specialLines** comment. This is the more common usage of special comments.

````js
/*!
  Copyright (C) 2023 by Darrell and his other brother Darrell
 */
````

### Options

Please read the [Comment Types](#comment-types) section which defines the comment types: delimited, delimitedLines, lineEnd, line, special, and specialLines.

#### options.delimited
Type: `Boolean`<br />
Default value: `true`

Determines whether or not to remove delimited comments.


#### options.delimitedLines
Type: `Boolean`<br />
Default value: `true`

Determines whether or not to remove delimitedLines comments.

#### options.lineEnd
Type: `Boolean`<br />
Default value: `true`

Determines whether or not to remove lineEnd comments.

#### options.line
Type: `Boolean`<br />
Default value: `true`

Determines whether or not to remove line comments.

#### options.special
Type: `Boolean`<br />
Default value: `false`

Determines whether or not to remove special comments.

#### options.specialLines
Type: `Boolean`<br />
Default value: `false`

Determines whether or not to remove specialLines comments.

#### options.language
Type: `String`<br />
Default value: `''`

Determines the syntax rules to use when searching for comments.

When language is empty, which is the default, grunt-delete-comments uses the file's extension to determine the delimiters.

Specify the language option only when you want to force grunt-delete-comments to use the delimiters associated with the given language.

### Advanced Options

#### options.aliases
Type: `Object`<br />
Default value: *none*

Use the aliases option to define file extensions you want to map to a [type definition](#options.types).

To use the type definition for JavaSscript (.js) for ".jsx" files:

````js
options {
  aliases: {
    jsx: 'js'
  }
}
````

You may specify one or more file type aliases.

The built-in aliases are:

````js
options {
  aliases: {
    htm: 'html',
    less: 'css',
    ts: 'js',
  }
}
````

#### options.types
Type: `Object`<br />
Default value: *none*

Use the types option to define comment delimiters for an unsupported file extension.

You must define five properties for each type: quoteChars, startDelimited, startDelimitedSpecial, endDelimited, and startLine.

For example, here are the type properties for 'js', a built-in type:

````js
options {
  types: {
    js: {
      quoteChars: '"\'`',
      startDelimited: '/*',
      startDelimitedSpecial: '/*!',
      endDelimited: '*/',
      startLine: '//',
      regex: true,
    }
  }
}

````

## Release History
- v 1.0.0 - Initial release
