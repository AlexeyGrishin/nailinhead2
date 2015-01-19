module.exports =
  coffeeSameFolder: (folder, bare = false) ->
    cwd: folder, dest: folder, options: {bare},        src:  ["**/*.coffee"], expand: true, ext: ".js"
  fromInto: (from, to, opts = {}) ->
    files = {}
    files[to] = from
    opts.files = files
    opts
  browserifyAllInto: (folder, to) ->
    module.exports.fromInto ["#{folder}/**/*.js"], to, {require: true}
  fromPublicToRelease: (folder, src = "*", options) ->
    expand: true, cwd: "public/#{folder}", src:src, dest: "release/#{folder}/", options: {context: options}
  watchFor: (sources...) ->
    run: (tasks...)->
      files: sources
      tasks: tasks

