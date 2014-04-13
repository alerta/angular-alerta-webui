'use strict';

/* Controllers */

var alertaControllers = angular.module('alertaControllers', []);

alertaControllers.controller('AlertListController', ['$scope', '$timeout', 'Config', 'Count', 'Environment', 'Service', 'Alert',
  function($scope, $timeout, Config, Count, Environment, Service, Alert){

    $scope.q = {};
    $scope.status = 'open';

    Config.query(function(response) {
      $scope.config = response;
    });

    Count.query($scope.q, function(response) {
      $scope.statusCounts = response.statusCounts;
      $scope.severityCounts = response.severityCounts;
    });

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

      $scope.q = angular.extend({}, $scope.q, $scope.widget);
      Alert.query($scope.q, function(response) {
        $scope.alerts = response.alerts;
      });
    };

    $scope.autorefreshAlerts = function() {

      $scope.q['environment'] = $scope.environment;
      $scope.q['service'] = $scope.service;
      $scope.q['status'] = $scope.status;

      $scope.q = angular.extend({}, $scope.q, $scope.widget);
      Alert.query($scope.q, function(response) {
        $scope.alerts = response.alerts;
      });
      $scope.timer = $timeout($scope.autorefreshAlerts, 5000);
    };

    $scope.alertLimit = 10;
    $scope.autorefreshAlerts();

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
      return SEVERITY_MAP[alert.severity];
    };

  }]);

alertaControllers.controller('AlertDetailController', ['$scope', '$route', '$routeParams', '$location', 'Alert',
  function($scope, $route, $routeParams, $location, Alert){

    Alert.get({id: $routeParams.id}, function(response) {
      $scope.alert = response.alert;
    });

    $scope.openAlert = function(id) {
      Alert.status({id: id}, {status: 'open', text: 'status change via console'}, function(data) {
        $route.reload();
      });
    };

    $scope.ackAlert = function(id) {
      Alert.status({id: id}, {status: 'ack', text: 'status change via console'}, function(data) {
        $route.reload();
      });
    };

    $scope.closeAlert = function(id) {
      Alert.status({id: id}, {status: 'closed', text: 'status change via console'}, function(data) {
        $route.reload();
      });
    };

    $scope.deleteAlert = function(id) {
      Alert.delete({id: id}, {}, function(data) {
        $location.path('/');
      });
    };

    $scope.back = function() {
      window.history.back();
    };

  }]);

alertaControllers.controller('AlertLinkController', ['$scope', '$location',
  function($scope, $location) {

    $scope.getDetails = function(alert) {
      $location.url('/alert/' + alert.id);
    };
  }]);
