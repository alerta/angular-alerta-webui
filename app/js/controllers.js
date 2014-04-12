'use strict';

/* Controllers */

var alertaControllers = angular.module('alertaControllers', []);

alertaControllers.controller('AlertListController', ['$scope', 'Environment', 'Service', 'Alert',
  function($scope, Environment, Service, Alert){

    $scope.status = 'open';
    $scope.options = ['open', 'ack', 'closed'];

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
  }]);

alertaControllers.controller('AlertDetailController', ['$scope', '$routeParams', 'Alert', 'AlertStatus',
  function($scope, $routeParams, Alert, AlertStatus){

    Alert.get({id: $routeParams.id}, function(response) {
      $scope.alert = response.alert;
    });

    $scope.openAlert = function(alertId) {
      console.log('AlertStatus.open({id: ' + alertId + '});')
      AlertStatus.open({id: alertId});
    };

    $scope.ackAlert = function(alertId) {
      console.log('AlertStatus.ack({id: ' + alertId + '});')
      AlertStatus.ack({id: alertId});
    };

    $scope.closeAlert = function(alertId) {
      console.log('AlertStatus.delete({id: ' + alertId + '});')
      AlertStatus.close({id: alertId});
    };

    $scope.deleteAlert = function(alertId) {
      console.log('Alert.delete({id: ' + alertId + '});')
      Alert.delete({id: alertId});
    };

  }]);

alertaControllers.controller('AlertLinkController', ['$scope', '$location',
  function($scope, $location) {

    $scope.getDetails = function(alert) {
      $location.url('/alert/' + alert.id);
    };
  }]);
