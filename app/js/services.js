'use strict';

/* Services */

var alertaServices = angular.module('alertaServices', ['config', 'ngResource']);

alertaServices.factory('Count', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/api/alerts/count', {}, {
      'query': {method:'GET'}
    });
  }]);

alertaServices.factory('Alert', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/api/alert/:id', {}, {
      'query':  {method:'GET', url: config.endpoint+'/api/alerts'},
      'save':   {method:'POST'},
      'get':    {method:'GET'},
      'status': {method:'POST', url: config.endpoint+'/api/alert/:id/status'},
      'remove': {method:'DELETE'},
      'delete': {method:'DELETE'},
      'tag':    {method:'POST', url: config.endpoint+'/api/alert/:id/tag'},
      'untag':  {method:'POST', url: config.endpoint+'/api/alert/:id/untag'},
      'top10':  {method:'GET', url: config.endpoint+'/api/alerts/top10'}
    });
  }]);

alertaServices.factory('Environment', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/api/environments?status=open', {}, {
      'all':  {method: 'GET'},
    });
  }]);

alertaServices.factory('Service', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/api/services', {}, {
      'all':  {method: 'GET'},
    });
  }]);

alertaServices.factory('Users', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/api/user', {}, {
      'query':  {method:'GET', url: config.endpoint+'/api/users'},
      'save':   {method:'POST'},
      'delete': {method:'DELETE', url: config.endpoint+'/api/user/:user'}
    });
  }]);

alertaServices.factory('Keys', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/api/key', {}, {
      'query':  {method:'GET', url: config.endpoint+'/api/keys/:user'},
      'save':   {method:'POST'},
      'delete': {method:'DELETE', url: config.endpoint+'/api/key/:key'}
    });
  }]);

alertaServices.factory('Profile', [
  function() {
    var profile = {
      'user': undefined,
      'email': undefined
    };
    return {
      getUser: function() {
        return profile.user;
      },
      getEmail: function() {
        return profile.email;
      },
      setUser: function(user) {
        profile.user = user;
      },
      setEmail: function(email) {
        profile.email = email;
      },
      clear: function() {
        profile.user = undefined;
        profile.email = undefined;
      }
    };
  }]);

alertaServices.factory('Heartbeat', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/api/heartbeats', {}, {
      'query':  {method:'GET'}
    });
  }]);

alertaServices.factory('Management', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/management/manifest', {}, {
      'manifest':    {method:'GET'},
      'healthcheck': {method:'GET', url: config.endpoint+'/management/healthcheck'},
      'status':      {method:'GET', url: config.endpoint+'/management/status'}
    });
  }]);


