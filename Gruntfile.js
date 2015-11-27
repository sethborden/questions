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
            jade: {
                files: ['./views/**/*.jade'],
                tasks: [],
                options: {
                    livereload: true
                }
            },
            css: {
                files: ['./public/**/*.css'],
                tasks: [],
                options: {
                    livereload: true
                }
            },
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
        },
        'node-inspector': {
            dev: {}
        }
    });

    ['grunt-contrib-jshint',
     'grunt-contrib-watch',
     'grunt-browserify',
     'grunt-express-server',
     'grunt-node-inspector'
    ].forEach(function(task) {
        grunt.loadNpmTasks(task);
    });

    grunt.registerTask('default', ['jshint', 'browserify', 'watch']);
    grunt.registerTask('serve', ['jshint', 'browserify', 'express:dev', 'watch']);
    grunt.registerTask('debug', ['jshint', 'browserify', 'node-inspector', 'express:dev']);

};
