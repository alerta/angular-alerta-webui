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

alertaServices.factory('Keys', ['$resource', 'endpoint',
  function($resource, endpoint) {
    return $resource(endpoint+'/api/key', {}, {
      'query':  {method:'GET', url: endpoint+'/api/keys/:user'},
      'save':   {method:'POST'},
      'delete': {method:'DELETE', url: endpoint+'/api/key/:key'}
    });
  }]);

alertaServices.factory('Profile', [
  function() {
    var profile = {
      'user': undefined
    };
    return {
      getUser: function() {
        return profile.user;
      },
      setUser: function(name) {
        profile.user = name;
      },
      clear: function() {
        profile.user = undefined;
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


