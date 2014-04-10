'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('MyCtrl1', [function() {

  }])
  .controller('MyCtrl2', [function() {

  }])

  .controller('GetAlerts', ['$scope', 'Alerts', function($scope, Alerts){
    Alerts.query(function(response){
      $scope.status = response.status;
      $scope.alerts = response.alerts;
    })

  }]);
