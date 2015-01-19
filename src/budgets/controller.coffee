module.exports = (app) ->

  app.directive 'readOnly', ->
    (scope, el, attrs) ->
      scope.$watch attrs.readOnly, (val) ->
        inputs = el.find("input")
        buttons = el.find('button')
        if val
          inputs.attr('readonly', 'readonly')
          buttons.attr('disabled', 'disabled')
        else
          inputs.removeAttr('readonly')
          buttons.removeAttr('disabled')

  #TODO: better to have service instead

  global =
    newModification: null

  app.controller 'BudgetsCtrl', ['$scope', 'TasksService', '$routeParams', '$location', (scope, TasksService, $routeParams, $location) ->
    renderBudget = (b) -> {id: b.objectId, name: b.name, remaining: b.remaining, amount: 0}
    createModification = (force = false) ->
      if global.newModification == null or force
        global.newModification =
          reason: "Причина пополнения"
          total: 0
          budgets: scope.budgets.filter((b) => !b.removed).map renderBudget
          update: ->
            @total = @budgets.reduce ((a,b) -> a + parseInt(b.amount)), 0
          validate: ->
            for budget in @budgets
              budget.amount = parseInt(budget.amount)
            @update()
            mod = TasksService.prepareModification({
              reason: @reason,
              total: @total,
              date: new Date(),
              budgets: {}
            })
            for budget in @budgets
              mod.budgets[budget.id] = [budget.remaining, budget.amount]
            mod
      else
        oldBudgets = global.newModification.budgets
        global.newModification.budgets = scope.budgets.filter((b) => !b.removed).map(renderBudget)
        global.newModification.budgets.forEach (b) ->
          b.amount = oldBudgets.filter((ob) -> ob.id == b.id)[0]?.amount ? 0
      scope.newModification = global.newModification

    loadModification = (id) ->
      mod = scope.modifications.filter((m) => m.objectId == id)[0]
      if not mod
        $location.url '/budgets/new'
        return
      {
        reason: mod.reason,
        total: mod.total,
        update: ->
        budgets: scope.budgets.map(renderBudget).
          filter((b) => mod.budgets[b.id]).
          map((b) =>
            b.remaining = mod.budgets[b.id][0]
            b.amount = mod.budgets[b.id][1]
            b
          )

      }

    continueLoad = ->
      scope.budgets = TasksService.user.budgets
      createModification()
      if $routeParams.modification == 'new'
        scope.currentModification = scope.newModification
        scope.readonly = false
      else
        scope.currentModification = loadModification($routeParams.modification)
        scope.readonly = true

    load = ->
      return if scope.loading.user
      scope.modifications = TasksService.modifications
      if scope.modifications.length == 0
        TasksService.loadModifications().then(continueLoad)
      else
        continueLoad()

    scope.$on "nih.loaded.user", load
    scope.$watch "currentModification.budgets", (->
      scope.currentModification?.update()
    ), true

    scope.addBudget = ->
      name = prompt("Название бюджета")
      return if not name
      TasksService.addBudget(name).then (budget) ->
        scope.newModification.budgets.push(renderBudget(budget))

    scope.removeBudget = (budget) ->
      budget.deleted = true
      TasksService.removeBudget(budget.id)


    scope.makeModification = ->
      TasksService.modifyBudgets(scope.currentModification.validate())
      scope.currentModification = createModification(true)

    load()
  ]