'use strict';


// Declare app level module which depends on filters, and services
var alertaApp = angular.module('alertaApp', [
  'ngRoute',
  'alertaFilters',
  'alertaServices',
  'alertaDirectives',
  'alertaControllers',
  'googleOauth'
])

alertaApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider
    .when('/alerts', {
      templateUrl: 'partials/alert-list.html',
      controller: 'AlertListController',
      reloadOnSearch: false
    })
    .when('/alert/:id', {
      templateUrl: 'partials/alert-details.html',
      controller: 'AlertDetailController'
    })
    .when('/top10', {
      templateUrl: 'partials/alert-top10.html',
      controller: 'AlertTop10Controller',
      reloadOnSearch: false
    })
    .when('/watch', {
      templateUrl: 'partials/alert-watch.html',
      controller: 'AlertWatchController'
    })
    .when('/about', {
      templateUrl: 'partials/about.html',
      controller: 'AboutController'
    })
    .when('/login', {
      templateUrl: 'partials/login.html',
      controller: 'LoginController'
    })
    .otherwise({
      redirectTo: '/alerts'
    });
  }]);

alertaApp.config(
  function(TokenProvider) {
    TokenProvider.extendConfig({
      clientId: '670909444171-la87bi7biqd7bdhv9vq5r05d76mpstrb.apps.googleusercontent.com',
      redirectUri: 'http://127.0.0.1/~nsatterl/angular-alerta-webui/app/oauth2callback',
      scopes: ["https://www.googleapis.com/auth/userinfo.email"]
    });
  });
