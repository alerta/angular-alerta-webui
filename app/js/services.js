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
      'status': {method:'PUT', url: config.endpoint+'/alert/:id/status'},
      'action': {method:'PUT', url: config.endpoint+'/alert/:id/action'},
      'remove': {method:'DELETE'},
      'delete': {method:'DELETE'},
      'tag':    {method:'PUT', url: config.endpoint+'/alert/:id/tag'},
      'untag':  {method:'PUT', url: config.endpoint+'/alert/:id/untag'}
    });
  }]);

alertaServices.factory('Top10', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint, {}, {
      'offenders': {method:'GET', url: config.endpoint+'/alerts/top10/count'},
      'flapping':  {method:'GET', url: config.endpoint+'/alerts/top10/flapping'},
      'standing':  {method:'GET', url: config.endpoint+'/alerts/top10/standing'}
    });
  }]);

alertaServices.factory('Environment', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/environments', {}, {
      'all':  {method: 'GET'},
    });
  }]);

alertaServices.factory('Service', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/services', {}, {
      'all':  {method: 'GET'},
    });
  }]);

alertaServices.factory('Blackouts', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/blackout', {}, {
      'query':  {method:'GET', url: config.endpoint+'/blackouts'},
      'save':   {method:'POST'},
      'delete': {method:'DELETE', url: config.endpoint+'/blackout/:id'}
    });
  }]);

alertaServices.factory('Users', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/user', {}, {
      'query':  {method:'GET', url: config.endpoint+'/users'},
      'save':   {method:'POST'},
      'update': {method:'PUT', url: config.endpoint+'/user/:user'},
      'delete': {method:'DELETE', url: config.endpoint+'/user/:user'}
    });
  }]);

alertaServices.factory('Perms', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/perm', {}, {
      'all':    {method:'GET', url: config.endpoint+'/perms'},
      'save':   {method:'POST'},
      'delete': {method:'DELETE', url: config.endpoint+'/perm/:id'}
    });
  }]);

alertaServices.factory('Customers', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/customer', {}, {
      'all':    {method:'GET', url: config.endpoint+'/customers'},
      'save':   {method:'POST'},
      'delete': {method:'DELETE', url: config.endpoint+'/customer/:id'}
    });
  }]);

alertaServices.factory('Keys', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/key', {}, {
      'query':  {method:'GET', url: config.endpoint+'/keys'},
      'save':   {method:'POST'},
      'delete': {method:'DELETE', url: config.endpoint+'/key/:key'}
    });
  }]);

alertaServices.factory('Heartbeat', ['$resource', 'config',
  function($resource, config) {
    return $resource(config.endpoint+'/heartbeat/:id', {}, {
      'query':  {method:'GET', url: config.endpoint+'/heartbeats'},
      'get':    {method:'GET'},
      'delete': {method:'DELETE'},
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
