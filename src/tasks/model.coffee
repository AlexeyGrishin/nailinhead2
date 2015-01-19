{removeById, findById, set, addIfNone} = require('../tools/array')
datings = require('../tools/datings')
class TasksService

  constructor: (@storage, @defer) ->

  promise: (value) ->
    d = @defer()
    d.resolve(value)
    d.promise

  checkLogin: () ->
    @promise(true)

  login: (user, password) ->
    @promise(true)

  logout: () ->
    @promise(true)

  loadUser: () ->
    @storage.loadUser().then((u) => @user = u)

  getBudget: (id) ->
    findById @user.budgets, id

  getTask: (id) ->
    findById @tasks, id

  setBudget: (id, month) ->
    @loadTasks(@getBudget(id), month)

  loadTasks: (budget, month) ->
    @currentBudget = budget
    @currentMonth = month
    @projects = []
    @tasks = []
    if cached = @_getcache @currentBudget, @currentMonth
      @tasks = cached
      @_rearrangeByProjects()
      return @promise(@tasks)
    @storage.loadTasks(@currentBudget, @currentMonth).then(
      (tasks) =>
        @tasks = tasks
        @_savecache @currentBudget, @currentMonth, tasks
        @_rearrangeByProjects()
    )

  _savecache: (budget, month, tasks) ->
    @cachedTasks[budget.objectId] ?= {}
    @cachedTasks[budget.objectId][month] = tasks
    tasks
  _getcache: (budget, month) ->
    @cachedTasks[budget.objectId]?[month]
  _clearcache: (budget) ->
    delete @cachedTasks[budget.objectId]

  prepareTaskIn: (project) ->
    @storage.prepareTaskIn(project, @currentBudget)

  canBuy: (task) ->
    @getTask(task.objectId).cost <= @currentBudget.remaining

  _rearrangeByProjects: ->
    names = set()
    @tasks.forEach (t) ->
      t.projects.forEach (p) -> names.push(p)
    @currentBudget.projects.forEach (p) -> names.push(p)
    self = @
    newprs = (names.map (name) =>
      name: name
      tasks: @tasks.filter((t) -> t.projects.indexOf(name) != -1)
      isEmpty: -> @tasks.length == 0
      canDelete: -> @isEmpty() and self.currentBudget.name != name
    )
    @projects.splice(0, @projects.length, newprs...)

  deleteProject: (project) ->
    throw "Cannot delete non-empty project" if not project.canDelete()
    @_modifyBudgetProjects(@currentBudget, null, project.name)
    @_rearrangeByProjects()

  addProject: (name) ->
    @_modifyBudgetProjects(@currentBudget, name)
    @_rearrangeByProjects()

  addBudget: (name) ->
    budget = @storage.prepareBudget({name, remaining: 0, projects: [name]})
    @user.budgets.push(budget)
    @storage.addBudget(budget)

  removeBudget: (budgetId) ->
    @getBudget(budgetId).removed = true
    @storage.removeBudget(@getBudget(budgetId))

  _validateTask: (task, changes) ->
    task = task || {}
    oldid = task.objectId
    if changes.cost1
      changes.cost = changes.cost1 * changes.amount
    angular.extend(task, changes)
    task.objectId = oldid
    task.projects ||= []
    task

  addTask: (task, project) ->
    task.projects = [project.name]
    task = @_validateTask(task, task)
    @tasks.push(task)
    @_rearrangeByProjects()
    @storage.addTask(@currentBudget.objectId, task)

  removeTask: (task) ->
    removeById(@tasks, task)
    @_rearrangeByProjects()
    @storage.removeTask(task)

  completeTask: (task) ->
    task.completed = true
    #TODO: concurrent?
    @storage.completeTask(task)
    @_modifyBudgetRemaining(@currentBudget, -task.cost)
    #todo: update budget after return

  _modifyBudgetRemaining: (budget, cost) ->
    budget.remaining += cost
    @storage.modifyBudgetRemaining(budget, cost)

  uncompleteTask: (task) ->
    task.completed = false
    @_modifyBudgetRemaining(@currentBudget, +task.cost)
    @storage.uncompleteTask(task)

  changeTask: (task, changes) ->
    task = @getTask(task.objectId)
    oldCost = task.cost
    task = @_validateTask(task, changes)
    if task.completed and task.cost != oldCost
      @_modifyBudgetRemaining(@currentBudget, oldCost - task.cost)
    @storage.changeTask(task, changes)
    @_rearrangeByProjects()

  _modifyBudgetProjects: (budget, projectToAdd, projectToDelete) ->
    addIfNone budget.projects, projectToAdd if projectToAdd
    if projectToDelete
      idx = budget.projects.indexOf(projectToDelete)
      budget.projects.splice(idx, 1) if idx > -1
    @storage.changeBudget budget, {projects: budget.projects}

  moveToBudget: (task, budgetId) ->
    removeById(@tasks, task)
    @_rearrangeByProjects()
    @_modifyBudgetRemaining(@currentBudget, +task.cost) if task.completed
    @storage.moveToBudget(task, budgetId)
    targetBudget = @getBudget(budgetId)
    @_modifyBudgetProjects targetBudget, task.projects[0]
    @_modifyBudgetRemaining(targetBudget, -task.cost) if task.completed
    @_clearcache(targetBudget)

  moveToMonth: (task, month) ->
    removeById(@tasks, task)
    @_rearrangeByProjects()
    @storage.moveToMonth(task, month)
    @_clearcache(@currentBudget)

  prepareModification: (data) ->
    @storage.prepareModification(data)

  modifyBudgets: (modification) ->
    for id, amounts of modification.budgets
      budget = @getBudget(id)
      @_modifyBudgetRemaining(budget, amounts[1])
    @modifications.push(modification)
    @storage.storeModification(modification)

  loadModifications: ->
    @storage.loadModifications().then((ms) => angular.copy(ms, @modifications))

  getReport: (dateTo, monthsBefore) ->
    monthTo = datings.toOrdinal(dateTo)
    monthFrom = monthTo - monthsBefore
    reportDefer = @defer()
    sum = (array, getter = (i) -> i) => array.reduce ((a,b) -> a + getter(b)), 0
    @storage.loadCompletedTasksBetween(monthFrom, monthTo).then((tasks) =>
      @loadModifications().then =>
        #report = months: [], projects: [{project: , permonth: [[tasks], [], tasks]},..]
        range = [monthFrom..monthTo]
        report =
          months: range.map(datings.fromOrdinal)
          projects: set(tasks.map((t) => t.projects[0])).map((p) -> {project: p, permonth: []})
          modifications:  range.map (mn) => @modifications.filter((m) => m.month == mn).map((m) =>
            title: m.reason
            cost: m.total
          )
        for month, i in range
          for project in report.projects
            project.permonth[i] = tasks.filter((t) => t.projects[0] == project.project and t.completedAt == month)
            project.permonth[i].cost = sum project.permonth[i], (it) -> it.cost
        report.modifications.cost = sum report.modifications, (it) -> it.cost
        reportDefer.resolve(report)
    )
    reportDefer.promise

  user: {budgets: []}
  currentBudget: {}
  currentMonth: new Date()
  tasks: []
  projects: []
  modifications: []
  cachedTasks: {}


module.exports = TasksService