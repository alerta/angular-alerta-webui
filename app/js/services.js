'use strict';

/* Services */

var alertaServices = angular.module('alertaServices', ['config', 'ngResource']);

alertaServices.factory('Count', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/alerts/count', {}, {
      'query': {method:'GET'}
    });
  }]);

alertaServices.factory('Alert', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/alert/:id', {}, {
      'query':  {method:'GET', url: config.endpoint+'/alerts'},
      'save':   {method:'POST'},
      'get':    {method:'GET'},
      'status': {method:'POST', url: config.endpoint+'/alert/:id/status'},
      'remove': {method:'DELETE'},
      'delete': {method:'DELETE'},
      'tag':    {method:'POST', url: config.endpoint+'/alert/:id/tag'},
      'untag':  {method:'POST', url: config.endpoint+'/alert/:id/untag'},
      'top10':  {method:'GET', url: config.endpoint+'/alerts/top10'}
    });
  }]);

alertaServices.factory('Environment', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/environments?status=open', {}, {
      'all':  {method: 'GET'},
    });
  }]);

alertaServices.factory('Service', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/services', {}, {
      'all':  {method: 'GET'},
    });
  }]);

alertaServices.factory('Users', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/user', {}, {
      'query':  {method:'GET', url: config.endpoint+'/users'},
      'save':   {method:'POST'},
      'delete': {method:'DELETE', url: config.endpoint+'/user/:user'}
    });
  }]);

alertaServices.factory('Keys', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/key', {}, {
      'query':  {method:'GET', url: config.endpoint+'/keys/:user'},
      'save':   {method:'POST'},
      'delete': {method:'DELETE', url: config.endpoint+'/key/:key'}
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
    return $resource(config.endpoint+'/heartbeats', {}, {
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


