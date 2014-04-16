'use strict';

/* Controllers */

var alertaControllers = angular.module('alertaControllers', []);

alertaControllers.controller('MenuController', ['$scope', '$route', 'Properties',
  function($scope, $route, Properties) {

    $scope.user = Properties.getUser();

    $scope.setUser = function(user) {
      Properties.setUser(user, function(data) {
        $route.reload();
      });
    };

  }]);

alertaControllers.controller('AlertListController', ['$scope', '$location', '$timeout', 'Config', 'Count', 'Environment', 'Service', 'Alert',
  function($scope, $location, $timeout, Config, Count, Environment, Service, Alert){

    Config.query(function(response) {
      $scope.config = response;
    });

    Environment.all(function(response) {
      $scope.environments = response.environments;
    });

    Service.all(function(response) {
      $scope.services = response.services;
    });

    $scope.status = 'open';

    $scope.refreshAlerts = function(timer) {

      $scope.combined = {};
      $scope.combined['environment'] = $scope.environment;
      $scope.combined['service'] = $scope.service;
      $scope.combined = angular.extend({}, $scope.combined, $scope.canned);

      Count.query($scope.combined, function(response) {
        $scope.statusCounts = response.statusCounts;
        $scope.severityCounts = response.severityCounts;
      });

      $scope.combined['status'] = $scope.status;

      Alert.query($scope.combined, function(response) {
        if (response.status == 'ok') {
          $scope.alerts = response.alerts;
        } else {
          $scope.alerts = [];
        }
        $scope.response_status = response.status;
        $scope.response_message = response.message;
      });
      if (timer) {
        $timeout(function() { $scope.refreshAlerts(true); }, 5000);
      };
    };

    $scope.alertLimit = 20;
    $scope.refreshAlerts(true);

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

    $location.search({
      'status': $scope.status,
      'environment': $scope.environment,
      'service': $scope.service,
      'query': $scope.canned,
      'limit': $scope.alertLimit
    });

  }]);

alertaControllers.controller('AlertDetailController', ['$scope', '$route', '$routeParams', '$location', 'Properties', 'Alert',
  function($scope, $route, $routeParams, $location, Properties, Alert){

    $scope.user = Properties.getUser();

    Alert.get({id: $routeParams.id}, function(response) {
      $scope.alert = response.alert;
    });

    $scope.openAlert = function(id) {
      Alert.status({id: id}, {status: 'open', text: 'status change via console'}, function(data) {
        $route.reload();
      });
    };

    $scope.tagAlert = function(id, tags) {
      Alert.tag({id: id}, {tags: tags}, function(data) {
        $route.reload();
      });
    };

    $scope.watchAlert = function(id, user) {
      Alert.tag({id: id}, {tags: ['watch:' + user]}, function(data) {
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
        window.history.back();
      });
    };

    $scope.back = function() {
      window.history.back();
    };

  }]);

alertaControllers.controller('AlertTop10Controller', ['$scope', '$timeout', 'Alert',
  function($scope, $timeout, Alert){

    Alert.top10(function(response) {
      if (response.status == 'ok') {
        $scope.top10 = response.top10;
      } else {
        $scope.top10 = [];
      }
      $scope.response_status = response.status;
      $scope.response_message = response.message;
    });

  }]);

alertaControllers.controller('AlertWatchController', ['$scope', '$timeout', 'Properties', 'Alert',
  function($scope, $timeout, Properties, Alert){

    $scope.refreshWatches = function(timer) {

      Alert.query({'tags':'watch:' + Properties.getUser()}, function(response) {
        if (response.status == 'ok') {
          $scope.watches = response.alerts;
        } else {
          $scope.watches = [];
        }
      });
      if (timer) {
        $timeout(function() { $scope.refreshWatches(true); }, 5000);
      };
    };

    $scope.refreshWatches(true);

  }]);

alertaControllers.controller('AlertLinkController', ['$scope', '$location',
  function($scope, $location) {

    $scope.getDetails = function(alert) {
      $location.url('/alert/' + alert.id);
    };
  }]);

alertaControllers.controller('AboutController', ['$scope', '$timeout', 'Management', 'Heartbeat',
  function($scope, $timeout, Management, Heartbeat) {

    Management.manifest(function(response) {
      $scope.manifest = response;
    });

    $scope.refreshAbout = function() {
      Management.status(function(response) {
        $scope.metrics = response.metrics;
        $scope.lastTime = response.time;
      });

      Heartbeat.query(function(response) {
        $scope.heartbeats = response.heartbeats;
      });
      $timeout($scope.refreshAbout, 5000);
    };
    $scope.refreshAbout();
  }]);
