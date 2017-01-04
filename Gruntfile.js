module.exports = function(grunt) {
    "use strict";
    // var RELOAD_PORT = 35729;
    var dirConfig = {
        src: "client",
        dest: "dist",
        index: "server/views",

        connect_port: 9000,
        connect_port_test: 9001,
        connect_live_reload: 35729,
        connect_hostname: 'localhost'
    };
    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"), // load the package.json
        // specify configuration for each plugin
        dir: dirConfig,
        uglify: {
            options: {
                mangle: false
            },
            // compress it dynamically, then concatenate with grunt concat.
            dist: {
                expand: true,
                cwd: "<%= dir.dest %>/scripts",
                dest: "<%= dir.dest %>/scripts",
                src: ["**/*.js"]
            }
        },
        copy: {
            dist: {
                expand: true,
                cwd: "<%= dir.src %>",
                dest: "<%= dir.dest %>",
                src: ["index.html", "fonts/**/*", "images/**/*", "views/**/*"]
            },
            index: {
                src: '<%= dir.dest %>/index.html',
                dest: '<%= dir.index %>/index.ejs',
            }
        },
        // Clean the distribution folder.
        clean: {
            dist: {
                src: ["<%= dir.dest %>", ".tmp"]
            },
            tmp: {
                src: ["<%= dir.dest %>/scripts/_tmp"]
            }
        },
        // ================ //
        // Angular Annotate //
        // ================ //
        // ng-annotate tries to make the code safe for minification automatically
        // by using the Angular long form for dependency injection.
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
        // ========================== //
        // Wire Dependencies of Bower //
        // ========================== //
        wiredep: {
            task: {
                src: ['<%= dir.src %>/index.html']
            }
        }, // End Wiredep
        // remove production files links from index.html
        processhtml: {
            options: {},
            files: {
                expand: true,
                cwd: "<%= dir.src %>",
                dest: "<%= dir.dest %>",
                src: ["index.html"]
            }
        },

        // ===== //
        // Watch //
        // ===== //
        watch: {
            scripts: {
                files: '<%= dir.src %>/scripts/**/*.js',
                options: {
                    livereload: '<%= dir.connect_live_reload %>'
                }
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            livereload: {
                options: {
                    livereload: '<%= dir.connect_live_reload %>'
                },
                files: [
                    '<%= dir.src %>/**/*.html',
                    '<%= dir.src %>/styles/**/*.less',
                    '<%= dir.src %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            },
            bower: {
                files: ['bower.json'],
                tasks: ['wiredep']
            }

        }, // End Watch

        // ======= //
        // Connect //
        // ======= //
        connect: {
            options: {
                port: '<%= dir.connect_port %>',
                base: '<%= dir.app %>',
                livereload: '<%= dir.connect_live_reload %>',
                hostname: '<%= dir.connect_hostname %>'
            },
            test: {
                options: {
                    port: '<%= dir.connect_port_test %>',
                    middleware: function(connect) {
                        return [
                            connect.static('.tmp'),
                            connect().use('/bower_components', connect.static('./bower_components')),
                            connect().use('/app/styles', connect.static('./app/styles')),
                            connect.static(appConfig.src)
                        ];
                    }
                }
            },
            livereload: {
                options: {
                    open: true,
                    middleware: function(connect) {
                        return [
                            connect.static('.tmp'),
                            connect().use('/bower_components', connect.static('./bower_components')),
                            connect().use('/app/styles', connect.static('./app/styles')),
                            connect.static(dirConfig.src)
                        ];
                    }
                }
            }
        }, // End Connect
        // ====== //
        // Usemin //
        // ====== //
        useminPrepare: {
            html: ['<%= dir.src %>/index.html'],
            options: {
                dest: '<%= dir.dest %>',
                flow: {
                    html: {
                        steps: {
                            js: ['concat'],
                            css: ['cssmin']
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
        // ============= //
        // File Revision //
        // ============= //
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
        }, // End FileRev
        // ======== //
        // Compress //
        // ======== //
        compress: {
            dist: {
                options: {
                    mode: 'zip',
                    archive: function() {
                        var date = new Date();
                        var dateString = date.getFullYear() + ("0"+(date.getMonth()+1)).slice(-2) + ("0" + date.getDate()).slice(-2)
                            + "-" + ("0" + date.getHours()).slice(-2) + ("0" + date.getMinutes()).slice(-2) + ("0" + date.getSeconds()).slice(-2);
                        return 't1c-demo-webapp-' + dateString + '.zip'
                    }
                },
                expand: true,
                cwd: '<%= dir.dest %>',
                src: ['**/*']
            }
        }, // End Compress
        json_generator: {
            t1tdev: {
                dest: "<%= dir.dest %>/keycloak.json",
                options: {
                    "realm": "T1T-Connector",
                    "realm-public-key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkhGQQV0fPQtH5dgzxnB0bZnv8QTndRJTClENNTnSqv/1XR/owXek8p+b6dlsGKgrEw02SehzA7lATsYf1/Vod9Uv5N2TjTLIem3E2gCfjdGjVa82By5JyfDRFiLXrn6c/tQ/NworuQC9CRZ2rRqu1LIQOwgLi57wsr8jSimRfNpO8fqesVLZhXJmOZOh2jowcZDpMgaXDGNKvN6GzVdejjhoUZmCkZAqgu9DOW+DphkdQdWznBdZtbyHB7RK0RC4i7D4YOG2INoNoWUaN15NpATzLz8DEzbGUjz3wal0ARn9s0gZjZlHYJfVml1CTeQL1FRhhD6UlfhzcclmgIBHFwIDAQAB",
                    "auth-server-url": "https://devidp.t1t.be/auth",
                    "ssl-required": "external",
                    "resource": "GCL-Demo",
                    "public-client": true
                }
            }
        }
    });
    // Load  all grunt plugins
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-processhtml");
    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-ng-annotate");
    grunt.loadNpmTasks('grunt-wiredep');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-filerev');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-json-generator');
    // Default Task (that can be run by typing only "grunt" in cmd)
    grunt.registerTask("default", 'build');
    grunt.registerTask("cleanBuild", ["clean:dist"]);
    // grunt.registerTask("build", ["clean:dist", "copy", "less:dist", "uglify", "concat", 'ngAnnotate',"clean:tmp", "processhtml"]);
    // grunt.registerTask("build", ['clean:dist', "copy", "less:dist", "json_generator:t1tdev", 'useminPrepare', 'concat', 'ngAnnotate', 'uglify', 'filerev', 'usemin', 'compress']);
    grunt.registerTask("build", ['clean:dist', "copy", "less:dist", "json_generator:t1tdev", 'useminPrepare', 'concat', 'ngAnnotate', 'uglify', 'filerev', 'usemin']);
    grunt.registerTask("dev", ["less:dev"]);
    grunt.registerTask("html", ["processhtml"]);
    grunt.registerTask('serve', 'Compile then start a connect web server', function(target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }
        grunt.task.run(['connect:livereload', 'watch']);
    });
};