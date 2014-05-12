'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
var alertaServices = angular.module('alertaServices', ['ngResource']);

alertaServices.factory('Settings', [
  function() {
    var config = {
      'alerta': "http://"+window.location.hostname+":8080"
      // 'alerta': "http://api.alerta.io"
    };
    return {
      getServer: function() {
        return config.alerta;
      },
      setServer: function(server) {
        config.alerta = server;
      }
    };
  }]);

alertaServices.factory('Count', ['$resource', 'Settings',
  function($resource, Settings) {
    var server = Settings.getServer()
    return $resource(server+'/api/alerts/count', {}, {
      'query': {method:'GET'}
    });
  }]);

alertaServices.factory('Alert', ['$resource', 'Settings',
  function($resource, Settings) {
    var server = Settings.getServer();
    return $resource(server+'/api/alert/:id', {}, {
      'query':  {method:'GET', url: server+'/api/alerts'},
      'save':   {method:'POST'},
      'get':    {method:'GET'},
      'status': {method:'POST', url: server+'/api/alert/:id/status'},
      'remove': {method:'DELETE'},
      'delete': {method:'DELETE'},
      'tag':    {method:'POST', url: server+'/api/alert/:id/tag'},
      'untag':  {method:'POST', url: server+'/api/alert/:id/untag'},
      'top10':  {method:'GET', url: server+'/api/alerts/top10'}
    });
  }]);

alertaServices.factory('Environment', ['$resource', 'Settings',
  function($resource, Settings) {
    var server = Settings.getServer();
    return $resource(server+'/api/environments?status=open', {}, {
      'all':  {method: 'GET'},
    });
  }]);

alertaServices.factory('Service', ['$resource', 'Settings',
  function($resource, Settings) {
    var server = Settings.getServer();
    return $resource(server+'/api/services', {}, {
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

alertaServices.factory('Heartbeat', ['$resource', 'Settings',
  function($resource, Settings) {
    var server = Settings.getServer();
    return $resource(server+'/api/heartbeats', {}, {
      'query':  {method:'GET'}
    });
  }]);

alertaServices.factory('Management', ['$resource', 'Settings',
  function($resource, Settings) {
    var server = Settings.getServer()
    return $resource(server+'/management/manifest', {}, {
      'manifest':    {method:'GET'},
      'healthcheck': {method:'GET', url: server+'/management/healthcheck'},
      'status':      {method:'GET', url: server+'/management/status'}
    });
  }]);


