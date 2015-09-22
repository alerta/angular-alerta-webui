'use strict';

/* Controllers */

angular.module('alertaControllers', [])

.controller('NavController', ['$scope', '$location', '$auth', '$mdDialog', '$mdSidenav', 'config', 'Service',
  function($scope, $location, $auth, $mdDialog, $mdSidenav, config, Service) {

    var nav = this;

    nav.showStatus = [
      {name: 'All', status: ['open', 'ack', 'assign', 'closed']},
      {name: 'Open', status: 'open'},
      {name: 'Active', status: ['open', 'ack', 'assign']},
      {name: 'Closed', status: 'closed'}
    ];
    nav.status = undefined;

    nav.showSearch = false;
    nav.search = undefined;

    nav.clear = function () {
      nav.showSearch = false;
      nav.search = undefined;
    };

    nav.profile = function($mdOpenMenu, ev) {
      if (nav.isAuthenticated()) {
        $mdOpenMenu(ev);
      } else {
        nav.authenticate();
      }
    };

    nav.menu = function() {
      $mdSidenav('left').toggle();
    };

      Service.all({}, function(response) {
        nav.services = response.services;
      });

    if ($auth.isAuthenticated()) {
      nav.name = $auth.getPayload().name;
      nav.login = $auth.getPayload().login;
    };

    nav.setService = function(service) {
      nav.service = service;
    };

    $scope.$on('login:name', function(evt, name) {
      nav.name = name;
    });

    nav.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };

    nav.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };

    nav.authenticate = function() {
      if (config.provider == 'basic') {
        $location.path('/login');
      } else {
        $auth.authenticate(config.provider)
        .then(function() {
          nav.name = $auth.getPayload().name;
          nav.login = $auth.getPayload().login;
        })
        .catch(function(e) {
          alert(JSON.stringify(e));
        });
      }
    };

    nav.showAbout = function ($event) {
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        targetEvent: $event,
        templateUrl: 'partials/about.html',
        controller: function($scope, $mdDialog) {
          $scope.cancel = function() {
            $mdDialog.cancel();
          };
          $scope.hide = function() {
            $mdDialog.hide();
          };
        }
      });
    };

  }])

.controller('AlertListController', ['$scope', '$route', '$location', '$timeout', '$auth', '$mdSidenav', 'colors', 'Count', 'Environment', 'Service', 'Alert',
  function($scope, $route, $location, $timeout, $auth, $mdSidenav, colors, Count, Environment, Service, Alert){

    var vm = this;

    if ($auth.isAuthenticated()) {
      vm.user = $auth.getPayload().name;
    } else {
      vm.user = undefined;
    };

    vm.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };

    var defaults = {
      severity: {
        critical: 'red',
        major: 'orange',
        minor: 'yellow',
        warning: '#1E90FF',
        indeterminate: 'silver',
        cleared: '#00CC00',
        normal: '#00CC00',
        ok: '#00CC00',
        informational: '#00CC00',
        debug: '#7554BF',
        security: 'black',
        unknown: 'silver'
      },
      text: 'black',
      highlight: 'skyblue '
    };

    vm.colors = angular.merge(defaults, colors);

    vm.autoRefresh = true;
    vm.refreshText = 'Auto Update';

    var search = $location.search();
    if (search.environment) {
      vm.environment = search.environment;
    }
    if (search.service) {
      vm.service = search.service;
    }
    if (search.status) {
      vm.status = search.status;
    } else {
      vm.status = 'open';
    }

    vm.menu = function() {
      $mdSidenav('left').toggle();
    };

    vm.selectedIndex = 0;

    vm.alerts = [];
    vm.alertLimit = 20;
    vm.reverse = true;
    vm.query = {};

    // vm.setService = function(service) {
    //   vm.service = service;
    //   updateQuery();
    //   refresh();
    // };

    vm.setEnv = function(environment) {
      vm.environment = environment;
      updateQuery();
      refresh();
    };

    $scope.$watchCollection('nav.status', function(current, previous) {
      vm.status = current;
      updateQuery();
      refresh();
    });

    $scope.$watch('nav.service', function(current) {
      vm.service = current;
      updateQuery();
      refresh();
    });

    vm.setStatus = function(status) {
      vm.status = status;
      updateQuery();
      refresh();
    };

    vm.refresh = function() {
      refresh();
    };

    var updateQuery = function() {
      if (vm.service) {
        vm.query['service'] = vm.service
      } else {
        delete vm.query['service'];
      }
      if (vm.environment) {
        vm.query['environment'] = vm.environment
      } else {
        delete vm.query['environment'];
      }
      if (vm.status) {
        vm.query['status'] = vm.status;
      } else {
        delete vm.query['status'];
      }
      $location.search(vm.query);
    };

    var refresh = function() {
      vm.refreshText = 'Refreshing...';
      Count.query({status: vm.status}, function(response) {
        vm.total = response.total;
        vm.statusCounts = response.statusCounts;
      });
      // Service.all({status: vm.status}, function(response) {
      //   vm.services = response.services;
      // });
      Environment.all({status: vm.status}, function(response) {
        vm.environments = response.environments;
      });
      updateQuery();
      Alert.query(vm.query, function(response) {
        if (response.status == 'ok') {
          vm.alerts = response.alerts;
        }
        vm.message = response.status + ' - ' + response.message;
        vm.autoRefresh = response.autoRefresh;
        if (vm.autoRefresh) {
          vm.refreshText = 'Auto Update';
        } else {
          vm.refreshText = 'Refresh';
        }
      });
    };
    var refreshWithTimeout = function() {
      if (vm.autoRefresh) {
        refresh();
      }
      timer = $timeout(refreshWithTimeout, 5000);
    };
    var timer = $timeout(refreshWithTimeout, 200);

    $scope.$on('$destroy', function() {
      if (timer) {
        $timeout.cancel(timer);
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
      'ok': 5,
      'informational': 6,
      'debug': 7,
      'security': 8,
      'unknown': 9
    };

    vm.reverseSeverityCode = function(alert) {
      return -SEVERITY_MAP[alert.severity];
    };

    vm.severityCode = function(alert) {
      return SEVERITY_MAP[alert.severity];
    };

    vm.getDetails = function (alert, event) {
      vm.selected = alert;
      $mdSidenav('right').toggle();
    };

    vm.bulkAlerts = [];

    vm.clickAlert = function($event, alert) {
      if ($event.metaKey) {
        var index = vm.bulkAlerts.indexOf(alert.id);
        if (index > -1) {
          vm.bulkAlerts.splice(index, 1);
        } else {
          vm.bulkAlerts.push(alert.id);
        }
      } else {
        $location.url('/alert/' + alert.id);
      }
    };

    vm.bulkOpenAlert = function(ids) {
      angular.forEach(ids, function(id) {
        Alert.status({id: id}, {status: 'open', text: 'bulk status change via console'}, function(data) {
          // $route.reload();
        });
      });
      $route.reload();
    };

    // vm.bulkTagAlert = function(id, tags) {
    //   Alert.tag({id: id}, {tags: tags}, function(data) {
    //     $route.reload();
    //   });
    // };

    vm.bulkWatchAlert = function(ids, user) {
      angular.forEach(ids, function(id) {
        Alert.tag({id: id}, {tags: ['watch:' + user]}, function(data) {
          // $route.reload();
        });
      });
      $route.reload();
    };

    vm.bulkUnwatchAlert = function(ids, user) {
      angular.forEach(ids, function(id) {
        Alert.untag({id: id}, {tags: ['watch:' + user]}, function(data) {
          // $route.reload();
        });
      });
      $route.reload();
    };

    vm.bulkAckAlert = function(ids) {
      angular.forEach(ids, function(id) {
        Alert.status({id: id}, {status: 'ack', text: 'bulk status change via console'}, function(data) {
          // $route.reload();
        });
      });
      $route.reload();
    };

    vm.bulkCloseAlert = function(ids) {
      angular.forEach(ids, function(id) {
        Alert.status({id: id}, {status: 'closed', text: 'bulk status change via console'}, function(data) {
          // $route.reload();
        });
      });
      $route.reload();
    };

    vm.bulkDeleteAlert = function(ids) {
      angular.forEach(ids, function(id) {
        Alert.delete({id: id}, {}, function(data) {
          // $location.path('/');
        });
      });
      $route.reload();
    };
  }])

.controller('AlertDetailController', ['$scope', '$route', '$routeParams', '$location', '$auth', 'Alert',
  function($scope, $route, $routeParams, $location, $auth, Alert){

    if ($auth.isAuthenticated()) {
      $scope.user = $auth.getPayload().name;
    } else {
      $scope.user = undefined;
    };

    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };

    Alert.get({id: $routeParams.id}, function(response) {
      $scope.alert = response.alert;
    });

    $scope.openAlert = function(id) {
      Alert.status({id: id}, {status: 'open', text: 'status change via console'}, function(data) {
        $route.reload();
      });
    };

    // $scope.tagAlert = function(id, tags) {
    //   Alert.tag({id: id}, {tags: tags}, function(data) {
    //     $route.reload();
    //   });
    // };

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
        $location.path('/');
      });
    };

    $scope.tagged = function(tags, tagged) {
      angular.forEach(tags, function(tag) {
        if (tag == tagged) {
          return true;
        };
        return false;
      });
    };

  }])

.controller('AlertTop10Controller', ['$scope', '$location', '$timeout', 'Count', 'Environment', 'Service', 'Alert',
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
    };

    $scope.setEnv = function(environment) {
      $scope.environment = environment;
      updateQuery();
      refresh();
    };

    $scope.setStatus = function(status) {
      $scope.status = status;
      updateQuery();
      refresh();
    };

    $scope.refresh = function() {
      refresh();
    };

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
    };

    var refresh = function() {
      Count.query({status: $scope.status}, function(response) {
        $scope.total = response.total;
        $scope.statusCounts = response.statusCounts;
      });
      Service.all({status: $scope.status}, function(response) {
        $scope.services = response.services;
      });
      Environment.all({status: $scope.status}, function(response) {
        $scope.environments = response.environments;
      });
      updateQuery();
      Alert.top10($scope.query, function(response) {
        if (response.status == 'ok') {
          $scope.top10 = response.top10;
        }
        $scope.message = response.status + ' - ' + response.message;
      });
      timer = $timeout(refresh, 5000);
    };
    var timer = $timeout(refresh, 200);

    $scope.$on('$destroy', function() {
      if (timer) {
        $timeout.cancel(timer);
      }
    });

  }])

.controller('AlertWatchController', ['$scope', '$route', '$location', '$timeout', '$auth',  'colors', 'Alert',
  function($scope, $route, $location, $timeout, $auth,  colors, Alert){

    if ($auth.isAuthenticated()) {
      $scope.user = $auth.getPayload().name;
    } else {
      $scope.user = undefined;
    };

    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };

    var defaults = {
      severity: {
        critical: 'red',
        major: 'orange',
        minor: 'yellow',
        warning: '#1E90FF',
        indeterminate: 'silver',
        cleared: '#00CC00',
        normal: '#00CC00',
        ok: '#00CC00',
        informational: '#00CC00',
        debug: '#7554BF',
        security: 'black',
        unknown: 'silver'
      },
      text: 'black',
      highlight: 'skyblue '
    };

    $scope.colors = angular.merge(defaults, colors);

    $scope.watches = [];

    var refresh = function() {
      Alert.query({'tags': 'watch:' + $auth.getPayload().name}, function(response) {
        if (response.status == 'ok') {
          $scope.watches = response.alerts;
        }
        $scope.message = response.status + ' - ' + response.message;
      });
      timer = $timeout(refresh, 5000);
    };
    var timer = $timeout(refresh, 200);

    $scope.$on('$destroy', function() {
      if (timer) {
        $timeout.cancel(timer);
      }
    });


    $scope.bulkAlerts = [];

    $scope.click = function($event,alert) {
      if ($event.metaKey) {
        var index = $scope.bulkAlerts.indexOf(alert.id);
        if (index > -1) {
          $scope.bulkAlerts.splice(index, 1);
        } else {
          $scope.bulkAlerts.push(alert.id);
        }
      } else {
        $location.url('/alert/' + alert.id);
      }
    };

    $scope.bulkOpenAlert = function(ids) {
      angular.forEach(ids, function(id) {
        Alert.status({id: id}, {status: 'open', text: 'bulk status change via console'}, function(data) {
          // $route.reload();
        });
      });
      $route.reload();
    };

    // $scope.bulkTagAlert = function(id, tags) {
    //   Alert.tag({id: id}, {tags: tags}, function(data) {
    //     $route.reload();
    //   });
    // };

    $scope.bulkWatchAlert = function(ids, user) {
      angular.forEach(ids, function(id) {
        Alert.tag({id: id}, {tags: ['watch:' + user]}, function(data) {
          // $route.reload();
        });
      });
      $route.reload();
    };

    $scope.bulkUnwatchAlert = function(ids, user) {
      angular.forEach(ids, function(id) {
        Alert.untag({id: id}, {tags: ['watch:' + user]}, function(data) {
          // $route.reload();
        });
      });
      $route.reload();
    };

    $scope.bulkAckAlert = function(ids) {
      angular.forEach(ids, function(id) {
        Alert.status({id: id}, {status: 'ack', text: 'bulk status change via console'}, function(data) {
          // $route.reload();
        });
      });
      $route.reload();
    };

    $scope.bulkCloseAlert = function(ids) {
      angular.forEach(ids, function(id) {
        Alert.status({id: id}, {status: 'closed', text: 'bulk status change via console'}, function(data) {
          // $route.reload();
        });
      });
      $route.reload();
    };

    $scope.bulkDeleteAlert = function(ids) {
      angular.forEach(ids, function(id) {
        Alert.delete({id: id}, {}, function(data) {
          // $location.path('/');
        });
      });
      $route.reload();
    };
  }])

.controller('AlertBlackoutController', ['$scope', '$route', '$timeout', '$auth', 'Blackouts', 'Environment', 'Service',
  function($scope, $route, $timeout, $auth, Blackouts, Environment, Service) {

    $scope.blackouts = [];

    var now = new Date();
    now.setSeconds(0,0);
    $scope.start = now;
    $scope.end = new Date(now);
    $scope.end.setMinutes(now.getMinutes() + 60);

    Service.all({status: $scope.status}, function(response) {
      $scope.services = response.services;
    });
    Environment.all({status: $scope.status}, function(response) {
      $scope.environments = response.environments;
    });

    $scope.createBlackout = function(environment,service,resource,event,group,tags,start,end) {
      if (service) {
        service = service.split(",");
      }
      if (tags) {
        tags = tags.split(",");
      }
      Blackouts.save({}, {environment: environment, service: service, resource: resource, event: event, group: group, tags: tags, startTime: start, endTime: end}, function(data) {
        $route.reload();
      });
    };

    $scope.deleteBlackout = function(id) {
      Blackouts.delete({id: id}, {}, function(data) {
        $route.reload();
      });
    };

    Blackouts.query({}, function(response) {
      $scope.blackouts = response.blackouts;
    });

  }])

.controller('UserController', ['$scope', '$route', '$timeout', '$auth', 'config', 'Users',
  function($scope, $route, $timeout, $auth, config, Users) {

    $scope.domains = [];
    $scope.users = [];
    $scope.login = '';
    $scope.provider = config.provider;

    switch (config.provider) {
      case "google":
        $scope.placeholder = "Google Email";
        break;
      case "github":
        $scope.placeholder = "GitHub username";
        break;
      case "twitter":
        $scope.placeholder = "Twitter username";
        break;
      default:
        $scope.placeholder = "Email";
    }

    $scope.createUser = function(name, login, password) {
      Users.save({}, {name: name, login: login, password: password, provider: config.provider, text: 'Added by '+$auth.getPayload().name}, function(data) {
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
      $scope.orgs = response.orgs;
      $scope.users = response.users;
    });

  }])

.controller('ApiKeyController', ['$scope', '$route', '$timeout', '$auth', 'Keys',
  function($scope, $route, $timeout, $auth, Keys) {

    $scope.keys = [];
    $scope.type = 'read-only';
    $scope.text = '';

    $scope.types = ['read-only', 'read-write'];

    $scope.createKey = function(type, text) {
      Keys.save({}, {user: $auth.getPayload().login, type: type, text: text}, function(data) {
        $route.reload();
      });
    };

    $scope.deleteKey = function(key) {
      Keys.delete({key: key}, {}, function(data) {
        $route.reload();
      });
    };

    Keys.query({user: $auth.getPayload().login}, function(response) {
      $scope.keys = response.keys;
    });

  }])

.controller('ProfileController', ['$scope', '$auth',
  function($scope, $auth) {

    $scope.user_id = $auth.getPayload().sub;
    $scope.name = $auth.getPayload().name;
    $scope.login = $auth.getPayload().login;
    $scope.provider = $auth.getPayload().provider;

    $scope.token = $auth.getToken();
    $scope.payload = $auth.getPayload();
  }])

.controller('StatsController', ['$scope', '$timeout', 'Management', 'Heartbeat',
  function($scope, $timeout, Management, Heartbeat) {

    var vm = this;

    Management.manifest(function(response) {
      vm.manifest = response;
    });

    vm.metrics = [];
    vm.heartbeats = [];

    var refresh = function() {
      Management.status(function(response) {
        vm.metrics = response.metrics;
        vm.lastTime = response.time;
        vm.uptime = response.uptime;
      });
      Heartbeat.query(function(response) {
        vm.heartbeats = response.heartbeats;
      });
      timer = $timeout(refresh, 10000);
    };
    var timer = $timeout(refresh, 200);

    $scope.$on('$destroy', function() {
      if (timer) {
        $timeout.cancel(timer);
      }
    });

  }])

.controller('LoginController', ['$scope', '$rootScope', '$auth', 'config',
  function($scope, $rootScope, $auth, config) {

    $scope.provider = config.provider;

    $scope.login = function(email, password) {
      $auth.login({
        email: $scope.email,
        password: $scope.password
      })
      .then(function() {
        $rootScope.$broadcast('login:name', $auth.getPayload().name);
      })
      .catch(function(e) {
        console.log(e);
        if (e.status == 401) {
          $scope.error = "Incorrect username or password.";
        };
        if (e.status == 403) {
          $scope.error = "Unauthorized access.";
        };
      });
    };

    $scope.authenticate = function(provider) {
      $auth.authenticate(provider)
      .then(function() {
        console.log('You have successfully logged in');
      })
      .catch(function(e) {
        console.log(e);
        $scope.error = e.statusText;
      });
    };
  }])

.controller('SignupController', ['$scope', '$rootScope', '$auth', 'config',
  function($scope, $rootScope, $auth, config) {

    $scope.provider = config.provider;

    $scope.signup = function(name, email, password, text) {
      $auth.signup({
        name: $scope.name,
        email: $scope.email,
        password: $scope.password,
        text: $scope.text
      })
      .then(function() {
        $rootScope.$broadcast('login:name', $auth.getPayload().name);
      })
      .catch(function(e) {
        console.log(e);
        $scope.error = e.statusText;
      });
    };

    $scope.authenticate = function(provider) {
      $auth.authenticate(provider)
      .then(function() {
        console.log('You have successfully logged in');
      })
      .catch(function(e) {
        console.log(e);
        $scope.error = e.statusText;
      });
    };
  }])

.controller('LogoutController', ['$auth',
  function($auth) {
    if (!$auth.isAuthenticated()) {
      return;
    }
    $auth.logout()
    .then(function() {
      console.log('You have been logged out');
    });
  }]);
