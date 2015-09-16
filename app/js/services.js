'use strict';

/* Services */

angular.module('alertaServices', ['config', 'ngResource'])

.factory('Count', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/alerts/count', {}, {
      'query': {method:'GET'}
    });
  }])

.factory('Alert', ['$resource', 'config',
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
  }])

.factory('Environment', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/environments', {}, {
      'all':  {method: 'GET'},
    });
  }])

.factory('Service', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/services', {}, {
      'all':  {method: 'GET'},
    });
  }])

.factory('Blackouts', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/blackout', {}, {
      'query':  {method:'GET', url: config.endpoint+'/blackouts'},
      'save':   {method:'POST'},
      'delete': {method:'DELETE', url: config.endpoint+'/blackout/:id'}
    });
  }])

.factory('Users', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/user', {}, {
      'query':  {method:'GET', url: config.endpoint+'/users'},
      'save':   {method:'POST'},
      'delete': {method:'DELETE', url: config.endpoint+'/user/:user'}
    });
  }])

.factory('Keys', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/key', {}, {
      'query':  {method:'GET', url: config.endpoint+'/keys/:user'},
      'save':   {method:'POST'},
      'delete': {method:'DELETE', url: config.endpoint+'/key/:key'}
    });
  }])

.factory('Heartbeat', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/heartbeats', {}, {
      'query':  {method:'GET'}
    });
  }])

.factory('Management', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/management/manifest', {}, {
      'manifest':    {method:'GET'},
      'healthcheck': {method:'GET', url: config.endpoint+'/management/healthcheck'},
      'status':      {method:'GET', url: config.endpoint+'/management/status'}
    });
  }]);
