class Set
  constructor: (items = []) ->
    @array = []
    items.forEach (i) => @push(i)
  push: (item) ->
    if @array.indexOf(item) == -1
      @array.push(item)
  map: (a...)-> @array.map(a...)
  sort: ->
    @array = @array.sort()
  slice: -> @array.slice()

removeById = (array, element, idAttr = 'objectId') ->
  elem = findById(array, element[idAttr], idAttr)
  if elem and array.indexOf(elem) != -1
    array.splice(array.indexOf(elem), 1)

findById = (array, id, idAttr = 'objectId') ->
  array.filter((e) -> e[idAttr] == id)[0]

addIfNone = (array, el) ->
  array.push(el) if array.indexOf(el) == -1


module.exports =
  removeById: removeById
  findById: findById
  addIfNone: addIfNone
  set: (items) -> new Set(items)
