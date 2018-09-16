'use strict';


var alertaApp = angular.module('alertaApp', [
  'config',
  'ngRoute',
  'ngSanitize',
  'alertaFilters',
  'alertaServices',
  'alertaDirectives',
  'alertaControllers',
  'satellizer'
])

alertaApp.config(['$locationProvider', function($locationProvider) {
  $locationProvider.hashPrefix('');
}]);

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
    .when('/logout', {
      templateUrl: 'partials/logout.html',
      controller: 'LogoutController'
    })
    .otherwise({
      redirectTo: '/alerts'
    });
  }]);

alertaApp.config(['$httpProvider',
  function ($httpProvider) {
    $httpProvider.interceptors.push(function ($q, $location) {
        return {
            'response': function (response) {
                //Will only be called for HTTP up to 300
                return response;
            },
            'responseError': function (rejection) {
                if(rejection.status === 401) {
                    $location.path('/login');
                }
                return $q.reject(rejection);
            }
        };
    });
}]);

alertaApp.config(['configProvider', '$authProvider',
  function (config, $authProvider) {
    $authProvider.loginUrl = config.endpoint+'/auth/login';
    $authProvider.signupUrl = config.endpoint+'/auth/signup';
    $authProvider.logoutRedirect = '/login';
    $authProvider.google({
      url: config.endpoint+'/auth/google',
      clientId: config.client_id
    });
    $authProvider.github({
      url: config.endpoint+'/auth/github',
      clientId: config.client_id,
      scope: ['user:email', 'read:org'],
      authorizationEndpoint: (config.github_url || 'https://github.com')+'/login/oauth/authorize'
    });
    $authProvider.oauth2({
      name: 'gitlab',
      url: config.endpoint+'/auth/gitlab',
      redirectUri: window.location.origin,
      clientId: config.client_id,
      authorizationEndpoint: (config.gitlab_url || 'https://gitlab.com')+'/oauth/authorize'
    });
    $authProvider.oauth2({
      name: 'keycloak',
      url: config.endpoint+'/auth/keycloak',
      redirectUri: window.location.origin,
      clientId: config.client_id,
      authorizationEndpoint: config.keycloak_url+'/auth/realms/'+config.keycloak_realm+'/protocol/openid-connect/auth'
    });
    $authProvider.oauth2({
      name: 'pingfederate',
      url: config.endpoint+'/auth/pingfederate',
      redirectUri: window.location.origin+'/',
      clientId: config.client_id,
      authorizationEndpoint: config.pingfederate_url,
      requiredUrlParams: ['pfidpadapterid', 'scope'],
      scope: 'openid+profile+email',
      pfidpadapterid: 'kerberos'
    });
}]);

// Load config.json, get remote /config and then bootstrap Angularjs
angular.element(document).ready(() => {
  var localConfigUrl = window.location.protocol+"//"+window.location.hostname+"/config.json";
  $.get(localConfigUrl, (localConfig) => {
    var remoteConfigUrl = localConfig.endpoint || window.location.protocol+"//"+window.location.hostname+":8080/config";
    $.get(remoteConfigUrl, (remoteConfig) => {
      alertaApp.config((configProvider) => {
        configProvider.initialize(localConfig, remoteConfig);
      });
      angular.bootstrap(document, ['alertaApp']);
    });
  });
});
