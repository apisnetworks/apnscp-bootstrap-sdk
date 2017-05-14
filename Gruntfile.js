/*!
 * Bootstrap's Gruntfile
 * https://getbootstrap.com
 * Copyright 2013-2017 The Bootstrap Authors
 * CopyrLicensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */

var APNSCP_PATH = "/usr/local/apnscp",
	THEME_PATH = APNSCP_PATH + "/public/css/themes",
	THEME = process.env['THEME'] || "apnscp",
	BUILD_JS = process.env['JS'] || false;
var es2015 = require('babel-preset-es2015');

module.exports = function (grunt) {
    'use strict'

    // Force use of Unix newlines
    grunt.util.linefeed = '\n'

    RegExp.quote = function (string) {
        return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&')
    }

    var path = require('path')
    var isTravis = require('is-travis')

    grunt.loadNpmTasks('grunt-browserify');
    var webpack = require("webpack");
    var webpackConfig = require("./webpack.config.js");

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*!\n' +
        ' * Bootstrap v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
        ' * Copyright 2011-<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
        ' * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)\n' +
        ' */\n',

        // Task configuration.
        clean: {
            dist: 'dist',
        },
        webpack: {
            options: webpackConfig,
            build: {}
        },

        // CSS build configuration
        copy: {
            webpack: {
                expand: true,
                cwd: 'js/src/',
                src: ['master.js', 'jquery.js', 'apnscp_init.js', 'apnscp.js', 'jquery_ui.js', 'clipboard.js'],
                dest: 'dist/js/'
            },
            js: {
                expand: true,
                cwd: 'dist/js/',
                src: [
                    '*'
                ],
                dest: APNSCP_PATH + '/public/js'
            },
            css: {
                expand: true,
                cwd: 'dist/css/',
                src: [
                    '*'
                ],
                dest: APNSCP_PATH + '/public/css/themes'
            }
        },

        watch: {
            src: {
                files: 'js/src/*.js',
                tasks: ['concat', 'copy:webpack', 'browserify', 'copy:js']
            },
            sass: {
                files: 'scss/**/*.scss',
                tasks: ['sass-compile', 'copy:css']
            },
        },

        exec: {
            'clean-css': {
                command: 'cleancss --skip-advanced --source-map --output dist/css/' + THEME + '.min.css dist/css/' + THEME + '.css'
            },
            postcss: {
                command: 'npm run postcss'
            },
            "sass": {
                command: "node-sass --sass-output-style expanded --source-map true --precision 6 scss/themes/" + THEME + ".scss " +
                    "dist/css/" + THEME + ".css"
            },
			'scss-clean': {
                command: "cleancss --skip-advanced --source-map --output dist/css/" + THEME + ".min.css dist/css/" + THEME + ".css"
			},
            'scss-lint': {
                command: 'npm run scss-lint'
            },
            uglify: {
                command: 'npm run uglify'
            },
        },

        compress: {
            main: {
                options: {
                    archive: 'apnscp-' + THEME + '-<%= pkg.version %>-dist.zip',
                    mode: 'zip',
                    level: 9,
                    pretty: true
                },
                files: [
                    {
                        expand: true,
                        cwd: 'dist/',
                        src: ['**'],
                        dest: 'apnscp-' + THEME + '-<%= pkg.version %>-dist'
                    }
                ]
            }
        }

    })

    require('jit-grunt')(grunt)
    require('time-grunt')(grunt)

    //grunt.registerTask('dist-js', ['babel:dev', 'concat', 'copy:webpack', 'babel:dist', 'browserify', 'copy:js', /*'exec:uglify'*/])
	grunt.registerTask('clean', ['exec:scss-clean']);
    grunt.registerTask('test-scss', ['exec:scss-lint'])
	grunt.registerTask('js-compile', ['babel:dev', 'concat', 'copy:webpack', 'copy:js']);
    grunt.registerTask('sass-compile', ['exec:sass', 'copy:css'])
    grunt.registerTask('dist-css', ['sass-compile', 'exec:postcss', 'exec:clean-css', 'copy:css'])

    // Full distribution task.
    grunt.registerTask('dist', ['clean:dist', 'dist-css'])

    grunt.registerTask('default', ['dist']);
    grunt.registerTask('prep-release', ['dist', 'compress'])
}