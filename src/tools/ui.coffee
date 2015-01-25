zeros = (val, count) ->
  s = val + ""
  if (s.length < count)
    zeros("0" + s, count)
  else
    s

module.exports = (app) ->

  #TODO: use service instead

  draggedTask = null


  app.directive 'nihDragTask', ->
    (scope, el, attrs) ->
      el.attr("draggable", "true")
      el.on "dragstart", (e) ->
        task = scope.$eval(attrs.nihDragTask)
        draggedTask = task
        e.dataTransfer.setData("task", task.objectId)
        scope.$root.$broadcast("nih.task.dragstart")
      el.on "dragend", (e) ->
        draggedTask = null
        scope.$root.$broadcast("nih.task.dragend")

  app.directive 'nihDropTask',['$timeout', ($timeout) ->
    (scope, el, attrs) ->
      inside = 0
      isCurrent = ->
        el.hasClass("selected") or scope.$eval(attrs.nihDropUnless, task: draggedTask)
      notCurrent = (fn) ->
        (args...) -> fn(args...) unless isCurrent()
      scope.$on "nih.task.dragstart", notCurrent ->
        inside = 0
        el.addClass("candrop")
      scope.$on "nih.task.dragend", notCurrent  ->
        el.removeClass("candrop readytodrop")
      isTask = (e) -> e.dataTransfer.getData("task") isnt undefined
      el.on "dragenter", notCurrent (e) ->
        inside++
        el.addClass("readytodrop") if isTask(e)
        e.stopPropagation()
      el.on "dragleave", notCurrent (e) ->
        inside--
        if isTask(e)
          $timeout (->
            if inside <= 1 #due to :after, I think
              el.removeClass("readytodrop")
              inside = 0
          ), 10
        e.stopPropagation()
      el.on "dragover", notCurrent (e) ->
        e.preventDefault() if isTask(e)
      el.on "drop", notCurrent (e) ->
        el.removeClass("candrop readytodrop")
        if isTask(e)
          scope.$apply ->
            scope.$eval(attrs.nihDropTask, task: draggedTask)
  ]

  app.directive 'nihCost', ->
    template: "<span><strong>{{high}}</strong><em>{{low}}</em></span>"
    scope: true
    link: (scope, el, attrs) ->
      scope.$watch attrs.nihCost, (val) ->
        scope.high = Math.floor(val / 1000)
        scope.high = "" if scope.high == 0
        scope.low = zeros(val % 1000, 3)

  app.directive 'nihBonds', ->
    replace: true
    template:
      """
      <div class="bonds">
      </div>
      """
    link: (scope, el, attrs) ->
      scope.$watch attrs.nihBonds, (val) ->
        el.empty()
        for key, limit of {bond50: 50000, bond5: 5000, bond1: 1000, bond500: 500, bond100: 100}
          while val >= limit
            el.prepend("<span class='#{key}'></span>")
            val -= limit


  app.directive 'countdown', ['$timeout', ($timeout) ->
    (scope, el, attrs) ->
      to = null
      target = null
      val = 0
      inFocus = false
      setElVal = (val) ->
        if el.is("input")
          el.val(val)
        else
          el.html(formatCost(val, '&nbsp;') + "")
      el.on('focus', -> inFocus = true).on('blur', -> inFocus = false)
      scope.$watch attrs.countdown, (newVal) ->
        clearTimeout(to)
        return if inFocus
        target = parseInt(newVal)
        target = 0 if isNaN(target)
        el.addClass("start-counting")
        step = scope.$eval(attrs.step) ? 1
        step = step * 2 while (Math.abs(target - val) / step) > MAX_STEPS
        doStep = ->
          if inFocus
            val = target
          if target == val
            el.removeClass("start-counting")
            setElVal(target)
            return
          if target > val
            val += step
            val = target if val > target
          else
            val -= step
            val = target if val < target
          setElVal(val)
          to = $timeout(doStep, 10)
        doStep()
  ]