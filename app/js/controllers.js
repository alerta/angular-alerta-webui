'use strict';

/* Controllers */

var alertaControllers = angular.module('alertaControllers', []);

alertaControllers.controller('MenuController', ['$scope', '$location', '$route', 'Properties',
  function($scope, $location, $route, Properties) {

    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };

    $scope.user = Properties.getUser();

    $scope.setUser = function(user) {
      Properties.setUser(user, function(data) {
        $route.reload();
      });
    };

  }]);

alertaControllers.controller('AlertListController', ['$scope', '$location', '$timeout', 'Config', 'Count', 'Environment', 'Service', 'Alert',
  function($scope, $location, $timeout, Config, Count, Environment, Service, Alert){

    $scope.alerts = [];
    $scope.alertLimit = 20;
    $scope.showAll = false;
    $scope.reverse = true;
    $scope.query = {};

    $scope.setEnv = function(env) {
      $scope.environment = env;
    };

    Service.all(function(response) {
      $scope.services = response.services;
    });

    var refresh = function() {
        Count.query({}, function(response) {
          $scope.statusCounts = response.statusCounts;
        });
        Environment.all(function(response) {
          $scope.environments = response.environments;
        });
        if (angular.isDefined($scope.service)) {
          $scope.query['service'] = $scope.service
        }
        if (angular.isDefined($scope.environment)) {
          $scope.query['environment'] = $scope.environment
        }
        if  ($scope.showActive) {
          $scope.query['status!'] = ["closed", "expired"];
        } else {
          $scope.query['status'] = ["open"];
        }
        Alert.query($scope.query, function(response) {
          if (response.status == 'ok') {
            $scope.alerts = response.alerts;
          }
          $scope.message = response.status + ' - ' + response.message;
          console.log(response.status);
        });
      timer = $timeout(refresh, 5000);
      console.log(timer);
    };
    var timer = $timeout(refresh, 5000);

    $scope.$on('$destroy', function() {
      if (timer) {
        $timeout.cancel(timer);
        console.log('destroyed...');
      }
    });

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

    $scope.reverseSeverityCode = function(alert) {
      return -SEVERITY_MAP[alert.severity];
    };

    $scope.severityCode = function(alert) {
      return SEVERITY_MAP[alert.severity];
    };

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

    $scope.unwatchAlert = function(id, user) {
      Alert.untag({id: id}, {tags: ['watch:' + user]}, function(data) {
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

    $scope.tagged = function(tags, tagged) {
      angular.forEach(tags, function(tag) {
        if (tag == tagged) {
          console.log('tagged with ' + tagged);
          return true;
        };
        console.log('tag ' + tagged + ' not found');
        return false;
      });
    };

    $scope.back = function() {
      window.history.back();
    };

  }]);

alertaControllers.controller('AlertTop10Controller', ['$scope', '$timeout', 'Alert',
  function($scope, $timeout, Alert){

    $scope.top10 = [];

    var refresh = function() {
        Alert.top10({}, function(response) {
          if (response.status == 'ok') {
            $scope.top10 = response.top10;
          }
          $scope.message = response.status + ' - ' + response.message;
          console.log(response.status);
        });
      timer = $timeout(refresh, 5000);
      console.log(timer);
    };
    var timer = $timeout(refresh, 5000);

    $scope.$on('$destroy', function() {
      if (timer) {
        $timeout.cancel(timer);
        console.log('destroyed...');
      }
    });

  }]);

alertaControllers.controller('AlertWatchController', ['$scope', '$timeout', 'Properties', 'Alert',
  function($scope, $timeout, Properties, Alert){

    $scope.watches = [];

    var refresh = function() {
        Alert.query({'tags': 'watch:' + Properties.getUser()}, function(response) {
          if (response.status == 'ok') {
            $scope.watches = response.alerts;
          }
          $scope.message = response.status + ' - ' + response.message;
          console.log(response.status);
        });
      timer = $timeout(refresh, 5000);
      console.log(timer);
    };
    var timer = $timeout(refresh, 5000);

    $scope.$on('$destroy', function() {
      if (timer) {
        $timeout.cancel(timer);
        console.log('destroyed...');
      }
    });

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

    $scope.metrics = [];
    $scope.heartbeats = [];

    var refresh = function() {
        // Management.healthcheck(function(response) {
        //   $scope.healthcheck = response;
        // });
        Management.status(function(response) {
          $scope.metrics = response.metrics;
          $scope.lastTime = response.time;
        });
        Heartbeat.query(function(response) {
          $scope.heartbeats = response.heartbeats;
        });
      timer = $timeout(refresh, 5000);
      console.log(timer);
    };
    var timer = $timeout(refresh, 5000);

    $scope.$on('$destroy', function() {
      if (timer) {
        $timeout.cancel(timer);
        console.log('destroyed...');
      }
    });

  }]);
