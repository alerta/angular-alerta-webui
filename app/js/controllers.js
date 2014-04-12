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

alertaControllers.controller('AlertDetailController', ['$scope', '$routeParams', '$location', 'Alert',
  function($scope, $routeParams, $location, Alert){

    Alert.get({id: $routeParams.id}, function(response) {
      $scope.alert = response.alert;
    });

    $scope.openAlert = function(id) {
      console.log('Alert.open({id: ' + id + '});')
      Alert.status({id: id}, {status: 'open', text: 'status change via console'});
    };

    $scope.ackAlert = function(id) {
      console.log('Alert.ack({id: ' + id + '});')
      Alert.status({id: id}, {status: 'ack', text: 'status change via console'});
    };

    $scope.closeAlert = function(id) {
      console.log('Alert.close({id: ' + id + '});')
      Alert.status({id: id}, {status: 'closed', text: 'status change via console'});
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
