datings = require('../tools/datings')

module.exports = (app) ->
  now = -> new Date()

  app.directive 'nihTaskEditor', ['$timeout', ($timeout) ->
    restrict: 'E'
    template:
      """
      <div class='task-editor'>
        <button class="icon icon-before-task remove" ng-click="remove({task:task})" title="Удалить">
          <img src="img/minus.svg"/>
        </button>
        <form>
        <div class='title'>
          <input ng-model="task.title" name="title" ng-class="{error: error.title}">
        </div>

        <div class='cost-inputs'>
          <input ng-model="task.cost1" name="cost1" ng-class="{error: error.cost1}">
          &times;
          <input ng-model="task.amount" name="amount" ng-class="{error: error.amount}">
        </div>
        <div class="buttons">
          <button class="icon" ng-click="doSave(task)" ng-disabled="error">
            <img src="img/check.svg"/>
          </button>
          <button class="icon" ng-click="cancel({task:task})">
            <img src="img/cross.svg"/>
          </button>
        </div>
        </form>
      </div>
      """
    scope:
      task: "="
      save: "&onSave"
      cancel: "&onCancel"
      remove: "&onRemove"
      focusField: "@"
    link: (scope, el, attrs) ->
      checkClickOutside = (e) ->
        ct = e.target
        while ct != document
          return if ct == el[0]
          ct = ct.parentNode
        scope.cancel()
      angular.element(document).on 'mousedown', checkClickOutside
      scope.$on "$destroy", ->
        angular.element(document).off 'mousedown', checkClickOutside
      el.on 'keydown', (e) ->
        if e.keyCode == 27  #esc
          scope.$apply -> scope.cancel()
      scope.$parent.$watch attrs.ngIf, ->
        $timeout ->
          input = el[0].querySelector("input[name=#{scope.focusField || 'title'}]")
          input.focus()
          input.select()

      scope.error = null
      validate = ->
        scope.error = {}
        anyError = false;
        if scope.task.title.trim() == ""
          scope.error.title = anyError = true
        cost1 = parseInt(scope.task.cost1)
        if isNaN(cost1)
          scope.error.cost1 = anyError = true
        amount = parseInt(scope.task.amount)
        if isNaN(amount) or amount < 1
          scope.error.amount = anyError = true
        scope.error = null unless anyError
      scope.$watch "task", validate, true
      scope.doSave = ->
        scope.task.cost1 = parseInt(scope.task.cost1)
        scope.task.amount = parseInt(scope.task.amount)
        scope.save(task:scope.task)
  ]

  app.controller 'TasksCtrl',
    ['$scope', '$routeParams', '$location', 'TasksService', (scope, $routeParams, $location, TasksService) ->
      scope.budgets = []
      load = ->
        return if scope.loading.user
        scope.budgets = TasksService.user.budgets
        if scope.budgets.length == 0
          return $location.url "/budgets/new"
        if $routeParams.budget
          scope.loading.tasks = true
          scope.currentMonth = parseInt($routeParams.date) || datings.nowOrdinal()
          scope.months = datings.monthsAround(datings.nowOrdinal(), 1).map((m) => {month: m, title: datings.monthFormat(m)})

          TasksService.setBudget($routeParams.budget, scope.currentMonth).then ->
            scope.loading.tasks = false
            scope.tasks = TasksService.tasks
            scope.projects = TasksService.projects
        else
          $location.url "/tasks/#{scope.budgets[0].objectId}"

      scope.$on "nih.loaded.user", load

      scope.selectDate = (month) ->
        $location.search('date', month)

      scope.addTask = (project) ->
        scope.editedTask = TasksService.prepareTaskIn(project)
      scope.editTask = (task, field) ->
        scope.originalTask = task
        scope.editedTask = angular.copy(task)
        scope.editFocusField = field || 'title'
      scope.resetEdit = ->
        scope.editedTask = null
      scope.isNewTaskForProject = (task, project) ->
        task and task.objectId is undefined and task.projects.indexOf(project.name) != -1
      scope.isEditedTask = (task) ->
        scope.editedTask and scope.editedTask.objectId == task.objectId
      scope.removeTask = (task) ->
        TasksService.removeTask(task)
        scope.resetEdit()
      scope.enoughToBuy = (task) ->
        TasksService.canBuy(task)
      scope.changeDate = (task, month) ->
        TasksService.moveToMonth(task, month)

      scope.saveTask = (task, project) ->
        #TODO: use id in TasksService.doSmthWTasks() methods
        if task.objectId
          TasksService.changeTask scope.originalTask, task
          scope.resetEdit()
        else
          TasksService.addTask task, project
          scope.addTask(project)
      scope.cancelTaskEdit = (task) -> scope.resetEdit()

      scope.prompt = (q) -> prompt(q)
      scope.addProject = (name) ->
        TasksService.addProject(name)

      scope.deleteProject = (project) ->
        TasksService.deleteProject(project)
      scope.moveTaskToProject = (project, task) ->
        TasksService.changeTask task,  projects: [project.name]
      scope.moveTask = (budget, task) ->
        TasksService.moveToBudget(task, budget.objectId)
      scope.toggle = (task)->
        if task.completed
          TasksService.uncompleteTask(task)
        else
          TasksService.completeTask(task)

      load()

    ]