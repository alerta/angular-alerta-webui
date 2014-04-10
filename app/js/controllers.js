'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('MyCtrl1', [function() {

  }])
  .controller('MyCtrl2', [function() {

  }])

  .controller('AlertListController', ['$scope', 'Alert', function($scope, Alert){
    Alert.query(function(response){
      $scope.status = response.status;
      $scope.alerts = response.alerts;
    })
  }])

  .controller('AlertDetailController', ['$scope', 'Alert', function($scope, Alert){
    Alert.get(function(response){
      $scope.status = response.status;
      $scope.alert = response.alert;
    })
  }]);
