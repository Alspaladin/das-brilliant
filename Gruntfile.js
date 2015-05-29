module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    stat: 'public',
    develop: 'develop',

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

    coffee: {
      dev: {
        files: {
          '<%= stat %>/js/application.js': [
            '<%= develop %>/coffee/settings.coffee', 
            '<%= develop %>/coffee/modules/*.coffee', 
            '<%= develop %>/coffee/document.coffee'
          ]
        }
      }
    },

    watch: {
      dev: {
        files: ['<%= develop %>/**/*.coffee', '<%= develop %>/**/*.styl'],
        tasks: ['stylus:dev', 'autoprefixer:dev', 'coffee:dev']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-autoprefixer');

  grunt.registerTask('dev', ['stylus:dev', 'autoprefixer:dev', 'coffee:dev', 'watch:dev']);
};