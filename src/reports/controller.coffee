datings = require('../tools/datings')

module.exports = (app) ->


  app.controller 'ReportsCtrl', ['$scope', '$routeParams', '$location', 'TasksService', (scope, $routeParams, $location, TasksService) ->
     scope.loading.report = true
     TasksService.getReport(new Date(), 2).then (report) ->
       scope.loading.report = false
       scope.report = report
       scope.report.months = scope.report.months.map(datings.monthFormat)
       scope.report.projects = scope.report.projects.sort((p1,p2) -> p1.project.localeCompare(p2.project))
  ]
