'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
var alertaServices = angular.module('alertaServices', ['ngResource']);

alertaServices.factory('Alert', ['$resource',
  function($resource) {
    return $resource('http://localhost:8080/api/alert/:id', {}, {
      'query':  {method: 'GET', url: 'http://localhost:8080/api/alerts'},
      'save':   {method: 'POST'},
      'get':    {method: 'GET', params:{id:''}},
      'remove': {method: 'DELETE', params:{id:''}},
      'delete': {method: 'DELETE', params:{id:''}}
    });
  }]);

alertaServices.factory('AlertStatus', ['$resource',
  function($resource) {
    return $resource('http://localhost:8080/api/alert/:id', {}, {
      'open':   {method: 'POST', url: 'http://localhost:8080/api/alert/:id/status', params:{id:'', status:'open'}},
      'ack':    {
        method: 'POST',
        url: 'http://localhost:8080/api/alert/:id/status',
        params:{status:'ack'},
        headers: {'Content-Type': 'application/json'}
      },
      'close':   {method: 'POST', url: 'http://localhost:8080/api/alert/:id/status', params:{id:'', status:'close'}},
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
