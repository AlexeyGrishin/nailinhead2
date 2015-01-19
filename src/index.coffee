TasksService = require('./tasks/model')
TasksStorage = require('./model/storage')
ParseStorage = require('./model/parse_storage')

app = angular.module('nailinhead2', ['ngRoute', 'Parse'])
  .config ['$routeProvider', ($routeProvider)->
    $routeProvider
      .when('/', redirectTo: '/tasks')
      .when('/login', controller: 'LoginCtrl', templateUrl: 'partial/login.html')
      .when('/tasks', controller: 'TasksCtrl', templateUrl: 'partial/tasks.html')
      .when('/tasks/:budget', controller: 'TasksCtrl', templateUrl: 'partial/tasks.html')
      .when('/budgets/', redirectTo: '/budgets/new')
      .when('/budgets/:modification', controller: 'BudgetsCtrl', templateUrl: 'partial/budgets.html')
      .when('/reports/', controller: 'ReportsCtrl', templateUrl: 'partial/reports.html')
]
require('./model/parse_storage')(app)
require('./tasks/controller')(app)
require('./budgets/controller')(app)
require('./reports/controller')(app)
require('./tools/ui')(app)

angular.module('nailinhead2').service 'TasksService', ["$q", "ParseStorage", ($q, ParseStorage) ->
  defer = -> $q.defer()
  #storage = new TasksStorage(defer)
  model = new TasksService(ParseStorage, defer)
  model
]

angular.module('nailinhead2').filter 'notRemoved', ->
  (items) -> items.filter((i) => !i.removed)

angular.module('nailinhead2').controller 'MainCtrl', ['$scope', 'TasksService', 'ParseStorage', '$location', (scope, TasksService, ParseStorage, $location) ->
  scope.loading = {
    user: true,
    tasks: true
  }
  scope.login = {
    loading: true,
    error: null,
    username: null,
    password: null,
    loggedIn: false
  }

  load = ->
    scope.login.loggedIn = true
    scope.login.loading = true
    TasksService.loadUser().then ->
      scope.login.loading = false
      scope.user = TasksService.user
      scope.loading.user = false
      scope.$broadcast("nih.loaded.user")

  ParseStorage.checkLoggedIn().then(
    load,
    (-> $location.url("/login"))
  )
  scope.logout = ->
    ParseStorage.logout()
    scope.login.loggedIn = false
    $location.url("/login")

  scope.$on 'nih.loggedIn', ->
    load()
    $location.url("/tasks")

]
angular.module('nailinhead2').controller 'LoginCtrl', ['$scope', 'TasksService', 'ParseStorage', (scope, TasksService, ParseStorage) ->
  scope.login.loading = false
  scope.doLogin = ->
    ParseStorage.login(scope.login.username, scope.login.password).then(
      (->
        scope.$emit("nih.loggedIn")
        scope.login.error = null
      ),
      ((e) -> scope.login.error = e.data.error)
    )
]


angular.module('nailinhead2').directive 'nihNavigation', ["$location", ($location) ->
  link: (scope, el, attrs) ->
    url = attrs.href or attrs.nihNavigation
    update = -> el.toggleClass("selected", $location.absUrl().indexOf(url) > -1)
    scope.$on '$locationChangeSuccess', update

    update()
    el.on 'click', -> scope.$apply -> $location.url(url.substring(1))
]