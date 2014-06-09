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
    // Demo configuration for the "angular-oauth demo" project on Google.
    // Log in at will!

    // Sorry about this way of getting a relative URL, powers that be.
    var baseUrl = document.URL.replace('example/demo.html', '');

    TokenProvider.extendConfig({
      clientId: '191261111313.apps.googleusercontent.com',
      redirectUri: baseUrl + 'src/oauth2callback.html',  // allow lunching demo from a mirror
      scopes: ["https://www.googleapis.com/auth/userinfo.email"]
    });
  });
