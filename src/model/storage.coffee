datings = require('../tools/datings')

storage =
  user:
    username: "test"
    budget: (id) ->
      @budgets.filter((b) -> b.objectId == parseInt(id))[0]
    budgetId: 5
    taskId: 5
    modId: 2
    task: (id) ->
      for b in @budgets
        for t in b.tasks
          if t.objectId+"" == id+""
            return t
    tasks: ->
      t = []
      for b in @budgets
        t = t.concat(b.tasks)
      t
    budgets: [
      {
        objectId: 1, name: "Еда", remaining: 15000, projects: ["Еда", "Химия"], tasks: [
          {objectId: 1, budgetid: 1, title: "Фрукты, овощи, мясо на пельмени, мука", cost1: 1500, amount: 1, cost: 1500, projects: ['Еда'], completed: true, completedAt: datings.toOrdinal(new Date())},
          {objectId: 2, budgetid: 1, title: "для нг", cost1: 2500, amount: 1, cost: 2500, projects: ['Еда'], completed: true, completedAt: datings.toOrdinal(new Date()) - 1},
          {objectId: 3, budgetid: 1, title: "для нг 2", cost1: 2500, amount: 1, cost: 2500, projects: ['Еда'], completed: true, completedAt: datings.toOrdinal(new Date()) - 1},
          {objectId: 4, budgetid: 1, title: "средство для стирки", cost1: 1000, amount: 1, cost: 1000, projects: ['Химия'], completed: false},
      ]
      },
      {objectId: 2, name: "Лехе", remaining: 5000, projects: ["Лехе"], tasks: []},
      {objectId: 3, name: "Лиде", remaining: 15000, projects: ["Лиде"], tasks: []},
      {objectId: 4, name: "Банк", remaining: 95000, projects: ["Ребенок", "Участок", "Квартира", "Машина"], tasks: []},
    ]
    modifications: [
      {
        objectId: 1,
        reason: "ЗП декабрь 2014",
        date: new Date(2014, 11, 16),
        month: datings.toOrdinal(new Date(2014, 11, 16)),
        total: +70000,
        budgets: {
          1: [0, +20000],
          2: [0, +5000],
          3: [0, +15000],
          4: [0, +30000]
        }}
    ]

class TempStorage
  constructor: (@defer) ->

  promise: (value) ->
    d = @defer()
    d.resolve(value)
    d.promise

  loadUser: ->
    @promise(storage.user)

  loadTasks: (budget, month) ->
    @promise(
      storage.user.budget(budget.objectId).tasks.filter((t) => not t.completed || t.completedAt == month)
    )

  addBudget: (budgetData) ->
    budget = {}
    for k,v of budgetData
      budget[k] = v
    budget.objectId = storage.user.budgetId++
    budget.tasks = []
    storage.user.budgets.push(budget)
    @promise(budget)

  removeBudget: (budget) ->
    storage.user.budget(budget.objectId).deleted = true
    @promise(true)

  changeBudget: (budget, projects) ->
    storage.user.budget(budget.objectId).projects = projects
    @promise(true)

  addTask: (budgetId, taskparams) ->
    task = {}
    for k,v of taskparams
      task[k] = v
    task.objectId = storage.user.taskId++
    task.budgetid = budgetId
    storage.user.budget(budgetId).tasks.push(task)
    @promise(task)

  removeTask: (task) ->
    storage.user.budget(task.budgetid).tasks = storage.user.budget(task.budgetid).tasks.filter((t) => t.objectId != task.objectId)
    @promise(true)

  completeTask: (task, date) ->
    task = storage.user.task(task.objectId)
    task.completed = true
    task.completedAt = datings.toOrdinal(date or new Date())
    @promise(task)

  modifyBudgetRemaining: (budget, deltaRemaining) ->
    storage.user.budget(budget.objectId).remaining += deltaRemaining
    @promise(storage.user.budget(budget.objectId))

  uncompleteTask: (task) ->
    task = storage.user.task(task.objectId)
    task.completed = false
    task.completedAt = null;
    @promise(task)

  changeTask: (task, changes) ->
    task = storage.user.task(task.objectId)
    for k,v of changes
      task[k] = v
    @promise(task)

  moveToBudget: (task, budgetId) ->
    task = storage.user.task(task.objectId)
    oldid = task.objectId
    @removeTask(task)
    @addTask(budgetId, task)
    task.objectId = oldid
    @promise(task)

  moveToMonth: (task, date) ->
    task = storage.user.task(task.objectId)
    task.completedAt = datings.toOrdinal(date or new Date())
    @promise(task)

  prepareModification: (data) -> data

  storeModification: (mod) ->
    mod = angular.copy(mod)
    mod.objectId =  storage.user.modId++
    mod.date = mod.date || new Date()
    mod.month = datings.toOrdinal(mod.date)
    storage.user.modifications.push(mod)
    @promise(mod)

  prepareTaskIn: (project, budget)->
    title: "Новая покупка"
    cost1: 1000
    amount: 1
    projects: [project.name]
    budgetid: budget.objectId
    completed: false

  prepareBudget: (budget) -> budget

  loadModifications: ->
    @promise(storage.user.modifications.map((m) => angular.copy(m)))

  loadCompletedTasksBetween: (from, to) ->
    @promise(storage.user.tasks().filter((t) => t.completed and t.completedAt >= from and t.completedAt <= to))

module.exports = TempStorage

