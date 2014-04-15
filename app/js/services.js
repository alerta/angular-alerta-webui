'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
var alertaServices = angular.module('alertaServices', ['ngResource']);

alertaServices.factory('Count', ['$resource',
  function($resource) {
    return $resource('http://localhost:8080/api/alerts/count', {}, {
      'query': {method:'GET'}
    });
  }]);

alertaServices.factory('Alert', ['$resource',
  function($resource) {
    return $resource('http://localhost:8080/api/alert/:id', {}, {
      'query':  {method:'GET', url: 'http://localhost:8080/api/alerts'},
      'save':   {method:'POST'},
      'get':    {method:'GET'},
      'status': {method:'POST', url:'http://localhost:8080/api/alert/:id/status'},
      'remove': {method:'DELETE'},
      'delete': {method:'DELETE'},
      'tag':    {method:'POST', url:'http://localhost:8080/api/alert/:id/tag'},
      'watch':  {method:'POST', url:'http://localhost:8080/api/alert/:id/tag'},
      'top10':  {method:'GET', url:'http://localhost:8080/api/alerts/top10?status!=closed'}
    });
  }]);

alertaServices.factory('Environment', ['$resource',
  function($resource) {
    return $resource('http://localhost:8080/api/environments', {}, {
      'all':  {method: 'GET'},
    });
  }]);

alertaServices.factory('Service', ['$resource',
  function($resource) {
    return $resource('http://localhost:8080/api/services', {}, {
      'all':  {method: 'GET'},
    });
  }]);

alertaServices.factory('Config', ['$resource',
  function($resource) {
    return $resource('config.json', {}, {
      'query':  {method: 'GET'},
    });
  }]);

alertaServices.factory('Heartbeat', ['$resource',
  function($resource) {
    return $resource('http://localhost:8080/api/heartbeats', {}, {
      'query':  {method:'GET'}
    });
  }]);

alertaServices.factory('Management', ['$resource',
  function($resource) {
    return $resource('http://localhost:8080/management/manifest', {}, {
      'manifest': {method:'GET'},
      'status':  {method:'GET', url:'http://localhost:8080/management/status'}
    });
  }]);


