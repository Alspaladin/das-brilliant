module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    stat: 'application/public',
    develop: 'develop',

    connect: {
      server: {
        options: {
          base: 'application',
          port: 5000,
          hostname: '*',
          keepalive: true
        }
      }
    },

    stylus: {
      dev: {
        options: {
          compress: false,
          linenos: true
        },
        files: {
          '<%= stat %>/css/application.css': '<%= develop %>/styl/main.styl'
        }
      }
    },

    autoprefixer: {
      dev: {
        options: {
          browsers: ['last 3 versions', 'ie 8', 'ie 9', 'Firefox > 2']  
        },
        src: '<%= stat %>/css/application.css'
      }
    },

    jade: {
      dev: {
        options: {
          pretty: true
        },
        files: [{
          expand: true,
          cwd: '<%= develop %>/jade',
          src: ['*.jade'],
          dest: 'application',
          ext: '.html'
        }]
      }
    },

    coffee: {
      dev: {
        files: {
          '<%= stat %>/js/application.js': ['<%= develop %>/coffee/modules/*.coffee', '<%= develop %>/coffee/*.coffee']
        }
      }
    },

    watch: {
      dev: {
        files: ['<%= develop %>/**/*.coffee', '<%= develop %>/**/*.styl', '<%= develop %>/**/*.jade'],
        tasks: ['stylus:dev', 'autoprefixer:dev', 'jade:dev', 'coffee:dev']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-autoprefixer');

  grunt.registerTask('default', ['connect'])
  grunt.registerTask('dev', ['stylus:dev', 'autoprefixer:dev', 'jade:dev', 'coffee:dev', 'watch:dev']);
};