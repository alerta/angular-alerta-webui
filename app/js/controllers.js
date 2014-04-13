'use strict';

/* Controllers */

var alertaControllers = angular.module('alertaControllers', []);

alertaControllers.controller('AlertListController', ['$scope', 'Count', 'Environment', 'Service', 'Alert',
  function($scope, Count, Environment, Service, Alert){

    $scope.status = 'open';
    $scope.options = ['open', 'ack', 'closed'];

    Count.query($scope.q, function(response) {
      $scope.statusCounts = response.statusCounts;
      $scope.severityCounts = response.severityCounts;
      console.log($scope.statusCounts);
    });

    $scope.q = {};

    Environment.all(function(response) {
      $scope.environments = response.environments;
    });

    Service.all(function(response) {
      $scope.services = response.services;
    });

    $scope.getAlerts = function() {

      $scope.q['environment'] = $scope.environment;
      $scope.q['service'] = $scope.service;
      $scope.q['status'] = $scope.status;

      console.log('q=' + $scope.q)
      console.log('env=' + $scope.environment + ' svc=' + $scope.service);

      Alert.query($scope.q, function(response) {
        $scope.alerts = response.alerts;
      });
    };

    $scope.alertLimit = 10;
    $scope.getAlerts();

    var SEVERITY_MAP = {
        'critical': 1,
        'major': 2,
        'minor': 3,
        'warning': 4,
        'indeterminate': 5,
        'cleared': 5,
        'normal': 5,
        'informational': 6,
        'debug': 7,
        'auth': 8,
        'unknown': 9
    };

    $scope.severityCode = function(alert) {
      console.log(alert);
      return SEVERITY_MAP[alert.severity];
    };

  }]);

alertaControllers.controller('AlertDetailController', ['$scope', '$route', '$routeParams', '$location', 'Alert',
  function($scope, $route, $routeParams, $location, Alert){

    Alert.get({id: $routeParams.id}, function(response) {
      $scope.alert = response.alert;
    });

    $scope.openAlert = function(id) {
      console.log('Alert.open({id: ' + id + '});')
      Alert.status({id: id}, {status: 'open', text: 'status change via console'}, function(data) {
        $route.reload();
      });
    };

    $scope.ackAlert = function(id) {
      console.log('Alert.ack({id: ' + id + '});')
      Alert.status({id: id}, {status: 'ack', text: 'status change via console'}, function(data) {
        $route.reload();
      });
    };

    $scope.closeAlert = function(id) {
      console.log('Alert.close({id: ' + id + '});')
      Alert.status({id: id}, {status: 'closed', text: 'status change via console'}, function(data) {
        $route.reload();
      });
    };

    $scope.deleteAlert = function(id) {
      console.log('Alert.delete({id: ' + id + '});')
      Alert.delete({id: id}, {}, function(data) {
        $location.path('/');
      });
    };

  }]);

alertaControllers.controller('AlertLinkController', ['$scope', '$location',
  function($scope, $location) {

    $scope.getDetails = function(alert) {
      $location.url('/alert/' + alert.id);
    };
  }]);
