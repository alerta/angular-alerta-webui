'use strict';


// Declare app level module which depends on filters, and services
var alertaApp = angular.module('alertaApp', [
  'ngRoute',
  'alertaFilters',
  'alertaServices',
  'alertaDirectives',
  'alertaControllers'
])

alertaApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
    .when('/alerts', {
      templateUrl: 'partials/alert-list.html',
      controller: 'AlertListController'
    })
    .when('/alert/:id', {
      templateUrl: 'partials/alert-details.html',
      controller: 'AlertDetailController'
    })
    .when('/about', {
      templateUrl: 'partials/about.html',
      controller: 'AboutController'
    })
    .otherwise({
      redirectTo: '/alerts'
    });
  }]);

