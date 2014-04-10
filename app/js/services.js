'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', ['ngResource'])
  .factory('Alert', ['$resource', function($resource) {
    return $resource('http://localhost:8080/api/alert/:id', {}, {
      'get':    {method: 'GET'},
      'save':   {method: 'POST'},
      'query':  {method: 'GET', url: 'http://localhost:8080/api/alerts'},
      'remove': {method: 'DELETE'},
      'delete': {method: 'DELETE'}
    })
  }])
  .value('version', '0.1');
