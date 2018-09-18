'use strict';

var alerta = alerta || {};

alerta.loadRoutes = function() {
  angular.module('alerta')

    .config(['$locationProvider', '$routeProvider', 'configProvider', function($locationProvider, $routeProvider, configProvider) {
      var config = configProvider.getConfig();

      $locationProvider.hashPrefix('');

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
        .when('/blackouts', {
          templateUrl: 'partials/blackouts.html',
          controller: 'AlertBlackoutController'
        })
        .when('/users', {
          templateUrl: 'partials/users.html',
          controller: 'UserController'
        })
        .when('/perms', {
          templateUrl: 'partials/perms.html',
          controller: 'PermissionsController'
        })
        .when('/customers', {
          templateUrl: 'partials/customers.html',
          controller: 'CustomerController'
        })
        .when('/keys', {
          templateUrl: 'partials/keys.html',
          controller: 'ApiKeyController'
        })
        .when('/profile', {
          templateUrl: 'partials/profile.html',
          controller: 'ProfileController'
        })
        .when('/heartbeats', {
          templateUrl: 'partials/heartbeats.html',
          controller: 'HeartbeatsController'
        })
        .when('/about', {
          templateUrl: 'partials/about.html',
          controller: 'AboutController'
        })
        .when('/login', {
          templateUrl: 'partials/login.html',
          controller: 'LoginController'
        })
        .when('/signup', {
          templateUrl: 'partials/signup.html',
          controller: 'SignupController'
        })
        .when('/confirm/:token', {
          templateUrl: 'partials/confirm.html',
          controller: 'ConfirmController'
        })
        .when('/forgot', {
          templateUrl: 'partials/forgot.html',
          controller: 'ForgotController'
        })
        .when('/reset/:token', {
          templateUrl: 'partials/reset.html',
          controller: 'ResetController'
        })
        .when('/logout', {
          templateUrl: 'partials/logout.html',
          controller: 'LogoutController'
        })
        .otherwise({
          redirectTo: '/alerts'
        });
    }]);
};
