'use strict';

angular.module('alertaApp')

.config(['$httpProvider',
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
}])

.config(['configProvider', '$authProvider',
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
