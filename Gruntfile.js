module.exports = function (grunt) {

  grunt.initConfig({
    pkg    : grunt.file.readJSON('package.json'),

    nodeunit: {
      all: ['spec/**/*Spec.js']
    },

    jshint: {
      files: ['Grunfile.js', 'lib/**/*.js']
    },

    watch  : {
      files : ['<%= jshint.files %>'],
      tasks : ['jshint', 'nodeunit']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['test']);
  grunt.registerTask('test', ['jshint', 'nodeunit']);
};