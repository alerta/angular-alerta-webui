'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
var alertaServices = angular.module('alertaServices', ['ngResource']);

alertaServices.value('endpoint', "http://"+window.location.hostname+":8080");

alertaServices.factory('Count', ['$resource', 'endpoint',
  function($resource, endpoint) {
    return $resource(endpoint+'/api/alerts/count', {}, {
      'query': {method:'GET'}
    });
  }]);

alertaServices.factory('Alert', ['$resource', 'endpoint',
  function($resource, endpoint) {
    return $resource(endpoint+'/api/alert/:id', {}, {
      'query':  {method:'GET', url: endpoint+'/api/alerts'},
      'save':   {method:'POST'},
      'get':    {method:'GET'},
      'status': {method:'POST', url: endpoint+'/api/alert/:id/status'},
      'remove': {method:'DELETE'},
      'delete': {method:'DELETE'},
      'tag':    {method:'POST', url: endpoint+'/api/alert/:id/tag'},
      'untag':  {method:'POST', url: endpoint+'/api/alert/:id/untag'},
      'top10':  {method:'GET', url: endpoint+'/api/alerts/top10'}
    });
  }]);

alertaServices.factory('Environment', ['$resource', 'endpoint',
  function($resource, endpoint) {
    return $resource(endpoint+'/api/environments?status=open', {}, {
      'all':  {method: 'GET'},
    });
  }]);

alertaServices.factory('Service', ['$resource', 'endpoint',
  function($resource, endpoint) {
    return $resource(endpoint+'/api/services', {}, {
      'all':  {method: 'GET'},
    });
  }]);

alertaServices.factory('Properties', [
  function() {
    var props = {
      'user': 'unknown'
    };
    return {
      getUser: function() {
        return props.user;
      },
      setUser: function(name) {
        props.user = name;
      }
    };
  }]);

alertaServices.factory('Config', ['$resource',
  function($resource) {
    return $resource('config.json', {}, {
      'query':  {method: 'GET'},
    });
  }]);

alertaServices.factory('Heartbeat', ['$resource', 'endpoint',
  function($resource, endpoint) {
    return $resource(endpoint+'/api/heartbeats', {}, {
      'query':  {method:'GET'}
    });
  }]);

alertaServices.factory('Management', ['$resource', 'endpoint',
  function($resource, endpoint) {
    return $resource(endpoint+'/management/manifest', {}, {
      'manifest':    {method:'GET'},
      'healthcheck': {method:'GET', url: endpoint+'/management/healthcheck'},
      'status':      {method:'GET', url: endpoint+'/management/status'}
    });
  }]);


