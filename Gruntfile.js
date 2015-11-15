'use strict';

module.exports = function(grunt) {

    grunt.initConfig({
        jshint: {
            files: ['Gruntfile.js', 'server.js', './app/**/*.js', './src/**/*.js'],
            options: {
                jshintrc: true
            }
        },
        browserify: {
            js: {
                src: './src/main.js',
                dest: './public/javascript/script.js'
            }
        },
        express: {
            dev: {
                options: {
                    script: './server.js',
                    debug: true
                }
            }
        },
        watch: {
            express: {
                files: ['server.js', './app/**/*.js'],
                tasks: ['express:dev'],
                options: {
                    spawn: false
                }
            },
            jshint: {
                files: ['<%= jshint.files %>'],
                tasks: ['jshint']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-express-server');

    grunt.registerTask('default', ['jshint', 'browserify', 'watch']);
    grunt.registerTask('serve', ['jshint', 'browserify', 'express:dev', 'watch']);

};
