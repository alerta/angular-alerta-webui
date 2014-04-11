'use strict';

/* Controllers */

var myAppControllers = angular.module('myAppControllers', []);


myAppControllers.controller('AlertListController', ['$scope', 'Alert',
  function($scope, Alert){
      $scope.alerts = Alert.query(function(response) {
        $scope.alerts = response.alerts;
      });
  }])

myAppControllers.controller('AlertDetailController', ['$scope', '$routeParams', 'Alert',
  function($scope, $routeParams, Alert){
    $scope.alert = Alert.get({id: $routeParams.id}, function(response) {
      $scope.alert = response.alert;
    })
  }]);
