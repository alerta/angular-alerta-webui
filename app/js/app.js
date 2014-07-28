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
    .when('/keys', {
      templateUrl: 'partials/keys.html',
      controller: 'ApiKeyController'
    })
    .when('/profile', {
      templateUrl: 'partials/profile.html',
      controller: 'ProfileController'
    })
    .when('/about', {
      templateUrl: 'partials/about.html',
      controller: 'AboutController'
    })
    .when('/logout', {
      templateUrl: 'partials/logout.html',
      controller: 'LogoutController'
    })
    .otherwise({
      redirectTo: '/alerts'
    });
  }]);

alertaApp.config(
  function(TokenProvider) {
    TokenProvider.extendConfig({
      clientId: '379647311730-hn94fk7lss64ohvs1ddc01sauuspeeea.apps.googleusercontent.com',
      redirectUri: 'http://localhost/~nsatterl/angular-alerta-webui/app/oauth2callback.html',
      scopes: ["https://www.googleapis.com/auth/userinfo.email"]
    });
  });
