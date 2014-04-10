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
  .when('/', {
    templateUrl: 'partials/partial1.html',
    controller: AlertListController
  })
  .when('/about', {
    templateUrl: 'partials/about.html',
    controller: AboutController
  })
  .when('/alerts', {
    templateUrl: 'partials/partial1.html',
    controller: AlertListController
  })
  .when('/alert/:id', {
    templateUrl: 'partials/partial2.html',
    controller: AlertDetailController
  })
  .otherwise({
    redirectTo: '/'
  });
