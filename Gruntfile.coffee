{coffeeSameFolder, fromInto, browserifyAllInto, fromPublicToRelease, watchFor} = require('./Gruntutils')

module.exports = (grunt)->
  version = require('./package.json').version

  grunt.initConfig {
    coffee:
      dev: coffeeSameFolder("src")
      tests: coffeeSameFolder("tests", true)
    browserify:
      dev: browserifyAllInto("src", 'public/js/index.js')
    less:
      dev: fromInto ["src/less/**/main.less"], "public/css/main.css"
    karma:
      options: configFile: 'karma.coffee'
      run: {options: singleRun: true}
      runBackground: {options: background: true}
    uglify:
      release: fromInto ["public/js/granula.js", "public/js/index.js"], "release/js/index.js"
    cssmin:
      release: fromInto ["public/css/main.css"], "release/css/main.css"
    clean:
      release: ['release']
    copy:
      fonts: fromPublicToRelease("css", "OpenSans*")
      images: fromPublicToRelease("img")
      lang: fromPublicToRelease("lang", "*.json")
    preprocess:
      release: fromPublicToRelease('', '**/*.html', {version, production: true})
    watch:
      coffee: watchFor("src/**/*.coffee", "public/*.html", "public/partial/*.html").run("dev")
      styles: watchFor("src/less/**/*.less").run("less")
      tests: watchFor("tests/**/*.coffee").run("unit-tests")
      release: watchFor("package.json").run("release")
  }


  grunt.loadNpmTasks name for name of grunt.file.readJSON('package.json').devDependencies when name[0..5] is 'grunt-'

  grunt.registerTask 'dev', ['less', 'coffee', 'browserify']
  grunt.registerTask 'release', ['dev', 'clean:release', 'uglify:release', 'preprocess:release', 'cssmin:release',
                                 'copy:lang', 'copy:images',
                                 # 'copy:someJs', 'copy:someCss',
                                 'copy:fonts']
  grunt.registerTask 'default', ['release']
