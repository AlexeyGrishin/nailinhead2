
BASE_YEAR = 2010
months = "январь, февраль, март, апрель, май, июнь, июль, август, сентябрь, октябрь, ноябрь, декабрь".split(",");

module.exports =

  nowOrdinal: ->
    module.exports.toOrdinal(new Date())

  toOrdinal: (date) ->
    return date if typeof date == "number"
    12*(date.getFullYear() - BASE_YEAR) + date.getMonth()

  fromOrdinal: (ord) ->
    return undefined if ord == undefined
    return ord if ord.getFullYear
    month = ord % 12
    year = BASE_YEAR + Math.floor(ord / 12)
    new Date(year, month, 1)

  monthFormat: (date) ->
    if typeof date == 'number'
      date = module.exports.fromOrdinal(date)
    "#{months[date.getMonth()]} #{date.getFullYear()} "

  monthsAround: (month, amount) ->
    last = month + amount
    today = module.exports.nowOrdinal()
    last = today if last > today
    first = last - amount*2 - 1
    [first..last]


