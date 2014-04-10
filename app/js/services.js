'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', ['ngResource'])
  .factory('Alerts', ['$resource', function($resource) {
    return $resource('http://localhost:8080/api/alerts', {}, {'query': {method: 'GET', isArray: false}})
  }])
  .value('version', '0.1');
