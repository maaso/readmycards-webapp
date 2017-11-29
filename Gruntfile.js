module.exports = function(grunt) {
    "use strict";
    var dirConfig = {
        src: "client",
        local: ".local",
        dest: "dist",
        index: "server/views"
    };

    // Load  all grunt plugins
    require("load-grunt-tasks")(grunt);

    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"), // load the package.json
        // specify configuration for each plugin
        dir: dirConfig,
        /**
         * UGLIFY ------------------------------------
         */
        uglify: {
            options: {
                mangle: false
            },
            dist: {
                expand: true,
                cwd: "<%= dir.dest %>/scripts",
                dest: "<%= dir.dest %>/scripts",
                src: ["**/*.js"]
            }
        },
        /**
         * BABEL -------------------------------------
         * Transpile the client JavaScript (ES6) to browser-safe JavaScript (ES5)
         */
        babel: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    "<%= dir.dest %>/scripts/app.js": "<%= dir.dest %>/scripts/app.js"
                }
            },
            dev: {
                expand: true,
                cwd: "<%= dir.src %>/scripts",
                dest: "<%= dir.local %>/scripts",
                src: ["**/*.js", "!plugins/**/*.js"]
            }
        },
        /**
         * COPY --------------------------------------
         */
        copy: {
            dist: {
                expand: true,
                cwd: "<%= dir.src %>",
                dest: "<%= dir.dest %>",
                src: ["index.html", "apublicfile.txt", "images/**/*", "fonts/**/*", "views/**/*", "scripts/plugins/GCLLib.js"]
            },
            local: {
                expand: true,
                cwd: "<%= dir.src %>",
                dest: "<%= dir.local %>",
                src: [ "images/**/*", "views/**/*", "fonts/**/*", "styles/**/*", "scripts/plugins/**/*.js" ]
            },
            fa : {
                expand: true,
                cwd: "bower_components/font-awesome/fonts",
                dest: "<%= dir.dest %>/fonts",
                src: ["**/*"]
            },
            faCss: {
                files: {
                    '<%= dir.dest %>/styles/font-awesome.min.css': 'bower_components/font-awesome/css/font-awesome.min.css'
                }
            },
            index: {
                src: '<%= dir.dest %>/index.html',
                dest: '<%= dir.index %>/index.ejs',
            },
            indexDev: {
                src: '<%= dir.src %>/index.html',
                dest: '<%= dir.index %>/index-dev.ejs'
            }
        },
        /**
         * CLEAN -------------------------------------
         */
        clean: {
            dist: {
                src: ["<%= dir.dest %>", ".tmp"]
            },
            local: {
                src: ["<%= dir.local %>"]
            },
            tmp: {
                src: ["<%= dir.dest %>/scripts/_tmp"]
            }
        },
        /**
         * ANGULAR ANNOTATE --------------------------
         * ng-annotate tries to make the code safe for minification automatically
         * by using the Angular long form for dependency injection.
         */
        ngAnnotate: {
            options: {
                singleQuotes: true
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= dir.dest %>/scripts',
                    src: '**/*.js',
                    dest: '<%= dir.dest %>/scripts'
                }]
            }
        }, // End Angular Annotate
        /**
         * LESS --------------------------------------
         */
        less: {
            options: {
                cleancss: true
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: "<%= dir.src %>/styles",
                    dest: "<%= dir.dest %>/styles",
                    src: "main.less",
                    ext: ".min.css"
                }, {
                    expand: true,
                    cwd: "<%= dir.src %>/styles/bootstrap",
                    dest: "<%= dir.dest %>/styles",
                    src: "bootstrap.less",
                    ext: ".min.css"
                }, {
                    expand: true,
                    cwd: "<%= dir.src %>/styles/vendors",
                    dest: "<%= dir.dest %>/styles",
                    src: "angular-material.min.css",
                    ext: ".min.css"
                }]
            },
            dev: {
                files: [{
                    expand: true,
                    cwd: "<%= dir.src %>/styles/bootstrap",
                    dest: "<%= dir.src %>/styles/vendors",
                    src: "bootstrap.less",
                    ext: ".min.css"
                }, {
                    expand: true,
                    cwd: "<%= dir.src %>/styles",
                    dest: "<%= dir.src %>/_tmp",
                    src: "main.less",
                    ext: ".min.css"
                }]
            }
        },
        /**
         * POSTCSS Autoprefixer ----------------------
         * https://github.com/postcss/autoprefixer
         */
        postcss: {
            options: {
                map: false,
                processors: [
                    require('autoprefixer')({
                        browsers: ['last 3 versions']
                    })
                ]
            },
            dist: {
                src: [ '<%= dir.dest %>/styles/main.min.css']
            },
            dev: {
                src: [ '<%= dir.src %>/styles/main.css']
            }
        },
        /**
         * PROCESS HTML ------------------------------
         */
        processhtml: {
            options: {},
            files: {
                expand: true,
                cwd: "<%= dir.src %>",
                dest: "<%= dir.dest %>",
                src: ["index.html"]
            }
        },
        /**
         * WATCH -------------------------------------
         */
        watch: {
            options: {
                livereload: 35734
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            livereload: {
                options: {
                    livereload: true
                },
                files: [
                    '<%= dir.src %>/**/*.html',
                    '<%= dir.src %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}',
                ],
                tasks: ['copy:local']
            },
            scripts: {
                options: {
                    livereload: true
                },
                files: ['<%= dir.src %>/scripts/**/*.js', '!<%= dir.src %>/scripts/plugins/**/*.js'],
                tasks: ['babel:dev', 'replace:local']
            },
            styles: {
                options: {
                    livereload: true
                },
                files: ['<%= dir.src %>/styles/**/*.less'],
                tasks: ['copy:local']
            },
            index: {
                options: {
                    livereload: true
                },
                files: [ '<%= dir.src %>/index.html' ],
                tasks: [ 'copy:indexDev' ]
            },
            plugins: {
                options: {
                    livereload: true
                },
                files: [ '<%= dir.src %>/scripts/plugins/**/*.js'],
                tasks: [ 'copy:local' ]
            }
        }, // End Watch
        /**
         * USEMIN ------------------------------------
         */
        useminPrepare: {
            html: ['<%= dir.src %>/index.html'],
            options: {
                dest: '<%= dir.dest %>',
                flow: {
                    html: {
                        steps: {
                            js: ['concat'],
                            css: []
                        },
                        post: {}
                    }
                }
            }
        },
        usemin: {
            html: ['<%= dir.dest %>/**/*.html'],
            css: ['<%= dir.dest %>/styles/**/*.css'],
            js: ['<%= dir.dest %>/scripts/**/*.js'],
            options: {
                assetsDirs: [
                    '<%= dir.dest %>',
                    '<%= dir.dest %>/images',
                    '<%= dir.dest %>/styles',
                    '<%= dir.dest %>/scripts'
                ],
                patterns: {
                    js: [[/(images\/[^''""]*\.(png|jpg|jpeg|gif|webp|svg))/g, 'Replacing references to images']]
                }
            }
        },// End Usmin
        /**
         * CSSMIN ------------------------------------
         * https://github.com/gruntjs/grunt-contrib-cssmin
         */
        cssmin: {
            options: {
                keepSpecialComments: '0'
            }
        },
        /**
         * REPLACE -----------------------------------
         */
        replace: {
            options: {
                patterns: [
                    { match: 'version', replacement: '<%= pkg.version %>' },
                    { match: 'name', replacement: '<%= pkg.name %>' }
                ]
            },
            local: {
                files: [{
                    expand: true,
                    cwd: '<%= dir.local %>/scripts',
                    dest: '<%= dir.local %>/scripts',
                    src: ['**/*.js']
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= dir.dest %>/scripts',
                    dest: '<%= dir.dest %>/scripts',
                    src: ['**/*.js']
                }],
                options: {
                    patterns: [
                        { match: 'version', replacement: '<%= pkg.version %>' },
                        { match: 'name', replacement: '<%= pkg.name %>' }
                    ]
                }
            },
            'dist-ga': {
                files: [{
                    expand: true,
                    cwd: '<%= dir.dest %>/scripts',
                    dest: '<%= dir.dest %>/scripts',
                    src: ['**/*.js']
                }],
                options: {
                    patterns: [
                        { match: 'ga-tracking-id', replacement: 'UA-91473749-1' },
                        { match: 'version', replacement: '<%= pkg.version %>' },
                        { match: 'name', replacement: '<%= pkg.name %>' }
                    ]
                }
            }
        },
        /**
         * FILE REVISION -----------------------------
         */
        filerev: {
            options: {
                encoding: 'utf8',
                algorithm: 'md5',
                length: 20
            },
            source: {
                files: [{
                    src: [
                        '<%= dir.dest %>/scripts/*.js',
                        '<%= dir.dest %>/styles/*.css'
                    ]
                }]
            }
        }
    });
    // Default Task (that can be run by typing only "grunt" in cmd)
    grunt.registerTask("default", 'build');
    grunt.registerTask("cleanBuild", ["clean:dist"]);
    grunt.registerTask("build", ['clean:dist', 'copy:dist', 'copy:fa', 'copy:faCss', 'less:dist', 'useminPrepare', 'postcss:dist', 'concat', 'ngAnnotate', 'babel:dist', 'replace:dist', 'uglify', 'filerev', 'usemin', 'copy:index']);
    grunt.registerTask("build-ga", ['clean:dist', 'copy:dist', 'copy:fa', 'copy:faCss', 'less:dist', 'useminPrepare', 'postcss:dist', 'concat', 'ngAnnotate', 'babel:dist', 'replace:dist-ga', 'uglify', 'filerev', 'usemin', 'copy:index']);
    grunt.registerTask("html", ["processhtml"]);
    grunt.registerTask('serve', 'Compile then watch for changes to files', function() {
        grunt.task.run(['clean:local', 'copy:local', 'copy:indexDev', 'babel:dev', 'replace:local', 'watch']);
    });
};