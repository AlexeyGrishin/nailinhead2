datings = require('../tools/datings')

module.exports = (app) ->

  app.config ["ParseProvider", (ParseProvider) ->
    ParseProvider.initialize("N2s46MO6asmNYF8eUHa7xK1otlwO03YOt21ul49Z", "uVAJvH7f0i2XpAtuoBVlYobT504MmRlL2GLLxZzS")
  ]

  app.service "ParseStorage", ["Parse", "$q", (Parse, $q) ->

    class Budget extends Parse.Model
      @configure "Budget", "name", "projects", "remaining", "ACL", "removed", "ownerid"

    class Task extends Parse.Model
      @configure "Task", "title", "cost1", "cost", "amount", "ACL", "ownerid", "budgetid", "completed", "completedAt", "completedDate", "projects"

    class Modification extends Parse.Model
      @configure "Modification", "reason", "total", "budgets", "ACL", "ownerid", "date", "month"

    pointer = (kls, id) ->
      if kls.objectId
        return pointer(kls.constructor.className, kls.objectId)
      {__type: "Pointer", className: kls, objectId: id}

    userid = -> Parse.auth.currentUser.objectId
    user = -> Parse.auth.currentUser
    userptr = -> pointer("_User", userid())
    dateptr = (date) -> {__type: 'Date', iso: date.toISOString()}
    ACL = ->
      acl = {}
      acl[userid()] = {read:true, write:true}
      acl

    checkLoggedIn: ->
      Parse.auth.resumeSession()

    login: (username, password) ->
      Parse.auth.login(username, password)

    logout: ->
      Parse.auth.logout()

    loadUser: ->
      d = $q.defer()
      Budget.query(where: {ownerid: userptr()}, order: 'createdAt').then (budgets) ->
        d.resolve {username: Parse.auth.currentUser.username, budgets}
      d.promise

    addBudget: (b) ->
      b.save()

    removeBudget: (budget) ->
      budget.removed = true
      b.save()

    changeBudget: (budget, changes) ->
      for k,v of changes
        budget[k] = v
      budget.save()

    prepareTaskIn: (project, budget)->
      new Task(
        title: "Новая покупка"
        cost1: 1000
        amount: 1
        projects: [project.name]
        budgetid: budget
        ownerid: userptr()
        ACL: ACL()
        completed: false
      )


    prepareBudget: (budgetData) ->
      new Budget(name: budgetData.name, projects: [budgetData.name], remaining: budgetData.remaining, removed: false, ownerid: userptr(), ACL: ACL())


    addTask: (budgetId, task) ->
      task.budgetid = pointer("Budget", budgetId)
      task.save()

    removeTask: (task) ->
      task.destroy()

    completeTask: (task) ->
      task.completed = true
      date = new Date()
      task.completedDate = dateptr(date)
      task.completedAt = datings.toOrdinal(date)
      task.save()

    changeTask: (task, changes) ->
      for k,v of changes
        task[k] = v
      task.save()

    moveToBudget: (task, budgetId) ->
      task.budgetid = pointer("Budget", budgetId)
      task.save()

    moveToMonth: (task, date) ->
      task.completedDate = dateptr(datings.fromOrdinal(date))
      task.completedAt = datings.toOrdinal(date)
      task.save()

    prepareModification: (data) ->
      new Modification(data)

    storeModification: (mod, date) ->
      date = date || new Date()
      mod.ACL = ACL()
      mod.ownerid = userptr()
      mod.date = dateptr(date)
      mod.month = datings.toOrdinal(date)
      mod.save()


    uncompleteTask: (task) ->
      task.completed = false
      task.save()

    _loadAllTasks: (month) ->
      Task.query(where: {
        $or: [
          {
            ownerid: userptr(),
            completed: true,
            completedAt: month
          },
          {
            ownerid: userptr(),
            completed: false
          }
        ]
      }, order: 'createdAt')

    loadTasks: (budget, month) ->
      return @_loadAllTasks(budget) if typeof budget == "number"
      Task.query(where: {
        $or: [
          {
            ownerid: userptr(),
            budgetid: pointer(budget),
            completed: true,
            completedAt: month
          },
          {
            ownerid: userptr(),
            budgetid: pointer(budget),
            completed: false
          }
        ]
      }, order: 'createdAt')

    loadModifications: ->
      Modification.query(where: {ownerid: userptr()}, order: 'createdAt')

    loadCompletedTasksBetween: (from, to) ->
      Task.query(where: {
        ownerid: userptr(),
        completed: true,
        completedAt: {$gte: from, $lte: to}
      })

    modifyBudgetRemaining: (budget, deltaRemaining) ->
      budget.save()
  ]
