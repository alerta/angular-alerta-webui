'use strict';

/* Controllers */

var alertaControllers = angular.module('alertaControllers', []);

alertaControllers.controller('MenuController', ['$rootScope', '$scope', '$http', '$window', '$location', '$route', 'Token', 'Profile',
  function($rootScope, $scope, $http, $window, $location, $route, Token, Profile) {

    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };

    $scope.$watch(Profile.getUser, function(user) {
      $scope.user = user;
    });

    $scope.setUser = function(user) {
      Profile.setUser(user, function(data) {
        $route.reload();
      });
    };

    $scope.isAuthenticated = function() {
      return (angular.isDefined(Profile.getUser()));
    };

    $scope.accessToken = Token.get();

    $scope.authenticate = function() {

      Profile.clear();
      Token.clear();
      delete $http.defaults.headers.common.Authorization;

      var extraParams = $scope.askApproval ? {approval_prompt: 'force'} : {};
      Token.getTokenByPopup(extraParams)
        .then(function(params) {
          // Success getting token from popup.

          // Verify the token before setting it, to avoid the confused deputy problem.
          Token.verifyAsync(params.access_token).
            then(function(data) {

              Token.set(params.access_token);

              Profile.setEmail(data.email);

              $rootScope.$apply(function() {

                $http.get('https://www.googleapis.com/oauth2/v1/userinfo?access_token='+params.access_token).success(function(data) {
                  Profile.setUser(data.name);
                 });

                $http.defaults.headers.common.Authorization = 'Token ' + Token.get();

                $location.url('/alerts');

              });
            }, function() {
              alert("Failed to verify token.")
            });

        }, function() {
          // Failure getting token from popup.
          alert("Failed to get token from popup.");
        });
    };

  }]);

alertaControllers.controller('AlertListController', ['$scope', '$location', '$timeout', 'Count', 'Environment', 'Service', 'Alert',
  function($scope, $location, $timeout, Count, Environment, Service, Alert){

    $scope.autoRefresh = true;
    $scope.refreshText = 'Auto Update';

    var search = $location.search();
    if (search.environment) {
      $scope.environment = search.environment;
    }
    if (search.service) {
      $scope.service = search.service;
    }
    if (search.status) {
      $scope.status = search.status;
    } else {
      $scope.status = 'open';
    }

    $scope.show = [
      {name: 'Open', status: 'open'},
      {name: 'Active', status: ['open', 'ack', 'assign']},
      {name: 'Closed', status: 'closed'}
    ]

    $scope.alerts = [];
    $scope.alertLimit = 20;
    $scope.reverse = true;
    $scope.query = {};

    $scope.setService = function(service) {
      $scope.service = service;
      updateQuery();
      refresh();
      // console.log('refresh after svc change=' + service + '/' + $scope.environment);
    };

    $scope.setEnv = function(environment) {
      $scope.environment = environment;
      updateQuery();
      refresh();
      // console.log('refresh after env change=' + $scope.service + '/' + environment);
    };

    $scope.setStatus = function(status) {
      $scope.status = status;
      updateQuery();
      refresh();
    };

    $scope.refresh = function() {
      refresh();
    };

    Service.all(function(response) {
      $scope.services = response.services;
    });

    var updateQuery = function() {
      if ($scope.service) {
        $scope.query['service'] = $scope.service
      } else {
        delete $scope.query['service'];
      }
      if ($scope.environment) {
        $scope.query['environment'] = $scope.environment
      } else {
        delete $scope.query['environment'];
      }
      if ($scope.status) {
        $scope.query['status'] = $scope.status;
      } else {
        delete $scope.query['status'];
      }
      $location.search($scope.query);
      // console.log('update url...');
    };

    var refresh = function() {
      $scope.refreshText = 'Refreshing...';
      // console.log('start env ' + $scope.environment);
      Count.query({}, function(response) {
        $scope.statusCounts = response.statusCounts;
      });
      Environment.all(function(response) {
        $scope.environments = response.environments;
      });
      // console.log('scope.service=' + $scope.service);
      updateQuery();
      // console.log($scope.query);
      Alert.query($scope.query, function(response) {
        if (response.status == 'ok') {
          $scope.alerts = response.alerts;
        }
        $scope.message = response.status + ' - ' + response.message;
        // console.log(response.status);
        $scope.autoRefresh = response.autoRefresh;
        if ($scope.autoRefresh) {
          $scope.refreshText = 'Auto Update';
        } else {
          $scope.refreshText = 'Refresh';
        }
      });
      // console.log('end env ' + $scope.environment);

      //console.log(timer);
    };
    var refreshWithTimeout = function() {
      if ($scope.autoRefresh) {
        refresh();
      }
      timer = $timeout(refreshWithTimeout, 5000);
    };
    var timer = $timeout(refreshWithTimeout, 200);

    $scope.$on('$destroy', function() {
      if (timer) {
        $timeout.cancel(timer);
        // console.log('destroyed...');
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

alertaControllers.controller('AlertDetailController', ['$scope', '$route', '$routeParams', '$location', 'Profile', 'Alert',
  function($scope, $route, $routeParams, $location, Profile, Alert){

    $scope.$watch(Profile.getUser, function(user) {
      $scope.user = user;
    });

    $scope.isAuthenticated = function() {
      console.log(angular.isDefined(Profile.getUser()));
      return (angular.isDefined(Profile.getUser()));
    };

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
          // console.log('tagged with ' + tagged);
          return true;
        };
        // console.log('tag ' + tagged + ' not found');
        return false;
      });
    };

    $scope.back = function() {
      window.history.back();
    };

  }]);

alertaControllers.controller('AlertTop10Controller', ['$scope', '$location', '$timeout', 'Count', 'Environment', 'Service', 'Alert',
  function($scope, $location, $timeout, Count, Environment, Service, Alert){

    var search = $location.search();
    if (search.environment) {
      $scope.environment = search.environment;
    }
    if (search.service) {
      $scope.service = search.service;
    }
    if (search.status) {
      $scope.status = search.status;
    } else {
      $scope.status = 'open';
    }

    $scope.show = [
      {name: 'Open', status: 'open'},
      {name: 'Active', status: ['open', 'ack', 'assign']},
      {name: 'Closed', status: 'closed'}
    ]

    $scope.top10 = [];
    $scope.query = {};

    $scope.setService = function(service) {
      $scope.service = service;
      updateQuery();
      refresh();
      // console.log('refresh after svc change=' + service + '/' + $scope.environment);
    };

    $scope.setEnv = function(environment) {
      $scope.environment = environment;
      updateQuery();
      refresh();
      // console.log('refresh after env change=' + $scope.service + '/' + environment);
    };

    $scope.setStatus = function(status) {
      $scope.status = status;
      updateQuery();
      refresh();
    };

    $scope.refresh = function() {
      refresh();
    };

    Service.all(function(response) {
      $scope.services = response.services;
    });

    var updateQuery = function() {
      if ($scope.service) {
        $scope.query['service'] = $scope.service
      } else {
        delete $scope.query['service'];
      }
      if ($scope.environment) {
        $scope.query['environment'] = $scope.environment
      } else {
        delete $scope.query['environment'];
      }
      if ($scope.status) {
        $scope.query['status'] = $scope.status;
      } else {
        delete $scope.query['status'];
      }
      $location.search($scope.query);
      // console.log('update url...');
    };

    var refresh = function() {
      Count.query({}, function(response) {
        $scope.statusCounts = response.statusCounts;
      });
      Environment.all(function(response) {
        $scope.environments = response.environments;
      });
      updateQuery();
      Alert.top10($scope.query, function(response) {
        if (response.status == 'ok') {
          $scope.top10 = response.top10;
        }
        $scope.message = response.status + ' - ' + response.message;
        // console.log(response.status);
      });
      timer = $timeout(refresh, 5000);
      // console.log(timer);
    };
    var timer = $timeout(refresh, 200);

    $scope.$on('$destroy', function() {
      if (timer) {
        $timeout.cancel(timer);
        // console.log('destroyed...');
      }
    });

  }]);

alertaControllers.controller('AlertWatchController', ['$scope', '$timeout', 'Profile', 'Alert',
  function($scope, $timeout, Profile, Alert){

    $scope.watches = [];

    var refresh = function() {
      Alert.query({'tags': 'watch:' + Profile.getUser()}, function(response) {
        if (response.status == 'ok') {
          $scope.watches = response.alerts;
        }
        $scope.message = response.status + ' - ' + response.message;
        // console.log(response.status);
      });
      timer = $timeout(refresh, 5000);
      // console.log(timer);
    };
    var timer = $timeout(refresh, 200);

    $scope.$on('$destroy', function() {
      if (timer) {
        $timeout.cancel(timer);
        // console.log('destroyed...');
      }
    });

  }]);

alertaControllers.controller('AlertLinkController', ['$scope', '$location',
  function($scope, $location) {

    $scope.getDetails = function(alert) {
      $location.url('/alert/' + alert.id);
    };
  }]);

alertaControllers.controller('UserController', ['$scope', '$route', '$timeout', 'Profile', 'Users',
  function($scope, $route, $timeout, Profile, Users) {

    $scope.domains = [];
    $scope.users = [];
    $scope.email = '';

    $scope.createUser = function(user) {
      Users.save({}, {user: user, sponsor: Profile.getUser()}, function(data) {
        $route.reload();
      });
    };

    $scope.deleteUser = function(user) {
      Users.delete({user: user}, {}, function(data) {
        $route.reload();
      });
    };

    Users.query(function(response) {
      $scope.domains = response.domains;
      $scope.users = response.users;
    });

  }]);

alertaControllers.controller('ApiKeyController', ['$scope', '$route', '$timeout', 'Profile', 'Keys',
  function($scope, $route, $timeout, Profile, Keys) {

    $scope.keys = [];
    $scope.text = '';

    $scope.createKey = function(text) {
      Keys.save({}, {user: Profile.getUser(), text: text}, function(data) {
        $route.reload();
      });
    };

    $scope.deleteKey = function(key) {
      Keys.delete({key: key}, {}, function(data) {
        $route.reload();
      });
    };

    Keys.query({user: Profile.getUser()}, function(response) {
      $scope.keys = response.keys;
    });

  }]);

alertaControllers.controller('ProfileController', ['$scope', 'Profile', 'Token',
  function($scope, Profile, Token) {

    $scope.user = Profile.getUser();
    $scope.email = Profile.getEmail();
    $scope.accessToken = Token.get();

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
        $scope.uptime = response.uptime;
      });
      Heartbeat.query(function(response) {
        $scope.heartbeats = response.heartbeats;
      });
      timer = $timeout(refresh, 10000);
      // console.log(timer);
    };
    var timer = $timeout(refresh, 200);

    $scope.$on('$destroy', function() {
      if (timer) {
        $timeout.cancel(timer);
        // console.log('destroyed...');
      }
    });

  }]);

alertaControllers.controller('LoginController', ['$scope', '$http', 'Token', 'Profile',
  function($scope, $http, Token, Profile) {

    Profile.clear();
    Token.clear();
    delete $http.defaults.headers.common.Authorization;

}]);

alertaControllers.controller('LogoutController', ['$scope', '$http', '$location', 'Token', 'Profile',
  function($scope, $http, $location, Token, Profile){

    Profile.clear();
    Token.clear();
    delete $http.defaults.headers.common.Authorization;

    $location.path('/')
}]);
