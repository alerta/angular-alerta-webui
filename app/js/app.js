'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider
  .when('/alerts', {
    templateUrl: 'partials/partial1.html',
    controller: 'AlertListController'
  })
  .when('/alert/:id', {
    templateUrl: 'partials/partial2.html',
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
