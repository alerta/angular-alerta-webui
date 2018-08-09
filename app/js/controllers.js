'use strict';

/* Controllers */

var alertaControllers = angular.module('alertaControllers', []);

alertaControllers.controller('MenuController', ['$scope', '$location', '$auth', 'config',
  function($scope, $location, $auth, config) {

    if ($auth.isAuthenticated()) {
      $scope.name = $auth.getPayload().name;
    };

    $scope.$on('login:name', function(evt, name) {
      $scope.name = name;
    });

    $scope.isActive = function (viewLocation) {
        return viewLocation === $location.path();
    };

    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };

    $scope.isAdmin = function() {
      if ($auth.isAuthenticated()) {
        return $auth.getPayload().scope.includes('admin');
      } else {
        return false;
      }
    };

    $scope.hasPermission = function(perm) {
      function isInScope(scope) {
        var scopes = $auth.isAuthenticated() ? ($auth.getPayload().scope || '').split(' ') : [];
        if (scopes.includes(scope) || scopes.includes(scope.split(':')[0])) {
          return true;
        } else if (scope.startsWith('read')) {
          return isInScope(scope.replace('read', 'write'));
        } else if (scope.startsWith('write')) {
          return isInScope(scope.replace('write', 'admin'))
        }
      }

      if ($auth.isAuthenticated()) {
        var scopes = ($auth.getPayload().scope || '').split(' ');
        if (scopes.includes(perm) || scopes.includes(perm.split(':')[0])) {
          return true;
        } else if (perm.startsWith('read')) {
          return isInScope(perm.replace('read', 'write'));
        } else if (perm.startsWith('write')) {
          return isInScope(perm.replace('write', 'admin'))
        }
      } else {
        return false;
      }
    };

    $scope.isCustomerViews = function() {
      if ($auth.isAuthenticated()) {
        return 'customers' in $auth.getPayload() || 'customer' in $auth.getPayload();
      } else {
        return false;
      }
    };

    $scope.isBasicAuth = function() {
      return config.provider == 'basic';
    };

    $scope.authenticate = function() {
      if (config.provider == 'basic') {
        $location.path('/login');
      } else if (config.provider == 'saml2') {
        let auth_win;
        window.addEventListener('message', event => {
          if (event.source === auth_win) {
            if (event.data && event.data.status && event.data.status === 'ok' && event.data.token) {
              $scope.$apply(() => {
                $auth.setToken(event.data.token);
                $scope.name = $auth.getPayload().name;
                $location.path('/');
              });
            } else if (event.data && event.data.status && event.data.status === 'error' && event.data.message) {
              alert('Error while getting token: ' + event.data.message);
            } else {
              alert('Error while getting token: ' + JSON.stringify(event));
            }
          }
        }, { once: true });
        auth_win = window.open(config.endpoint + '/auth/saml?usePostMessage', 'Authenticating...');
      } else {
        $auth.authenticate(config.provider)
          .then(function() {
            $scope.name = $auth.getPayload().name;
            $location.path('/');
          })
          .catch(function(e) {
            alert(JSON.stringify(e));
          });
        }
    };

  }]);

alertaControllers.controller('AlertListController', ['$scope', '$route', '$location', '$timeout', '$auth', 'config', 'Count', 'Environment', 'Service', 'Alert',
  function($scope, $route, $location, $timeout, $auth, config, Count, Environment, Service, Alert){

    var byUser = '';
    if ($auth.isAuthenticated()) {
      $scope.user = $auth.getPayload().name;
      byUser = ' by ' + $scope.user;
     } else {
       $scope.user = undefined;
     };

    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };

    var colorDefaults = {
      severity: {
        security: 'blue',
        critical: 'red',
        major: 'orange',
        minor: 'yellow',
        warning: '#1E90FF',
        indeterminate: 'lightblue',
        cleared: '#00CC00',
        normal: '#00CC00',
        ok: '#00CC00',
        informational: '#00CC00',
        debug: '#7554BF',
        trace: '#7554BF',
        unknown: 'silver'
      },
      text: 'black',
      highlight: 'skyblue '
    };

    $scope.colors = angular.merge(colorDefaults, config.colors);

    $scope.autoRefresh = true;
    $scope.refreshText = 'Auto Update';

    var search = $location.search();
    if (search.environment) {
      $scope.environment = search.environment;
    }
    if (search.service) {
      $scope.service = search.service;
    }

    $scope.show = [
      {name: 'Open', value: ['open', 'unknown']},
      {name: 'Active', value: ['open', 'ack', 'assign']},
      {name: 'Shelved', value: ['shelved']},
      {name: 'Closed', value: ['closed', 'expired']},
      {name: 'Blackout', value: ['blackout']}
    ];

    if (search.status) {
      $scope.status = {name: '', value: search.status};
    } else {
      $scope.status = $scope.show[0];
    }

    $scope.alerts = [];
    $scope.alertLimit = 20;
    $scope.reverse = true;
    $scope.query = {};

    $scope.setService = function(s) {
      if (s) {
        $scope.environment = s.environment;
        $scope.service = s.service;
      } else {
        $scope.environment = null;
        $scope.service = null;
      }
      updateQuery();
      refresh();
    };

    $scope.setEnv = function(environment) {
      $scope.environment = environment;
      updateQuery();
      refresh();
    };

    $scope.update = function() {
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
        $scope.query['status'] = $scope.status.value;
      } else {
        delete $scope.query['status'];
      }
      $location.search($scope.query);
    };

    Service.all({status: $scope.status.value}, function(response) {
      $scope.services = response.services;
    });

    var refresh = function() {
      $scope.refreshText = 'Refreshing...';
      Count.query({status: $scope.status.value}, function(response) {
        $scope.total = response.total;
        $scope.statusCounts = response.statusCounts;
      });
      // Service.all({status: $scope.status.value}, function(response) {
      //   $scope.services = response.services;
      // });
      Environment.all({status: $scope.status.value}, function(response) {
        $scope.environments = response.environments;
      });
      updateQuery();
      Alert.query($scope.query, function(response) {
        if (response.status == 'ok') {
          $scope.alerts = response.alerts;
        }
        $scope.message = response.status + ' - ' + response.message;
        $scope.autoRefresh = response.autoRefresh;
        if ($scope.autoRefresh) {
          $scope.refreshText = 'Auto Update';
        } else {
          $scope.refreshText = 'Refresh';
        }
      });
    };
    var refreshWithTimeout = function() {
      if ($scope.autoRefresh) {
        refresh();
      }
      timer = $timeout(refreshWithTimeout, config.refresh_interval || 5000);
    };
    var timer = $timeout(refreshWithTimeout, 200);

    $scope.$on('$destroy', function() {
      if (timer) {
        $timeout.cancel(timer);
      }
    });

    var severityCodeDefaults = {
      security: 0,
      critical: 1,
      major: 2,
      minor: 3,
      warning: 4,
      indeterminate: 5,
      cleared: 5,
      normal: 5,
      ok: 5,
      informational: 6,
      debug: 7,
      trace: 8,
      unknown: 9
    };

    var severityCodes = angular.merge(severityCodeDefaults, config.severity);

    $scope.reverseSeverityCode = function(alert) {
      return -severityCodes[alert.severity];
    };

    $scope.severityCode = function(alert) {
      return severityCodes[alert.severity];
    };

    $scope.audio = config.audio;
    $scope.$watch('alerts', function(current, old) {
      if (current.length > old.length && $scope.status.value.indexOf('open') > -1) {
        $scope.play = true;
      } else {
        $scope.play = false;
      }
    });

    $scope.bulkAlerts = [];

    $scope.click = function($event,alert) {
      if ($event.metaKey || $event.altKey) {
        var index = $scope.bulkAlerts.indexOf(alert.id);
        if (index > -1) {
          $scope.bulkAlerts.splice(index, 1);
        } else {
          $scope.bulkAlerts.push(alert.id);
        }
      } else if(!$event.ctrlKey){
        $location.url('/alert/' + alert.id);
    } else if($event.ctrlKey) {
        window.open('/#/alert' + alert.id, '_blank');
      }
    };

    $scope.bulkOpenAlert = function(ids) {
      angular.forEach(ids, function(id) {
        Alert.status({id: id}, {status: 'open', text: 'bulk status change via console' + byUser}, function(data) {
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
        Alert.status({id: id}, {status: 'ack', text: 'bulk status change via console' + byUser}, function(data) {
          // $route.reload();
        });
      });
      $route.reload();
    };

    $scope.bulkCloseAlert = function(ids) {
      angular.forEach(ids, function(id) {
        Alert.status({id: id}, {status: 'closed', text: 'bulk status change via console' + byUser}, function(data) {
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

    $scope.bulkOpenTabAlert = function(ids) {
      angular.forEach(ids, function(id) {
        window.open('/#/alert/' + id, '_blank');
      });
    };

    $scope.shortTime = config.dates && config.dates.shortTime || 'HH:mm';
    $scope.mediumDate = config.dates && config.dates.mediumDate || 'EEE d MMM HH:mm';
  }]);

alertaControllers.controller('AlertDetailController', ['$scope', '$route', '$routeParams', '$location', '$auth', 'config', 'Alert',
  function($scope, $route, $routeParams, $location, $auth, config, Alert){

    var ackComment = config.ack_comment || false;

    var byUser = '';
    if ($auth.isAuthenticated()) {
      $scope.user = $auth.getPayload().name;
      byUser = ' by ' + $scope.user;
     } else {
       $scope.user = undefined;
     };

    $scope.isAuthenticated = function() {
      return $auth.isAuthenticated();
    };

    Alert.get({id: $routeParams.id}, function(response) {
      $scope.alert = response.alert;
    });

    $scope.unackAlert = function(id) {
      Alert.action({id: id}, {action: 'unack', text: 'status change via console' + byUser}, function(data) {
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
      if (ackComment) {
        var ack_message = prompt("Please enter ack message", "");
      } else {
        var ack_message = 'status change via console';
      }
  
      Alert.action({id: id}, {action: 'ack', text: ack_message + byUser}, function(data) {
        $route.reload();
      });
    };

    $scope.shelveAlert = function(id, user, timeout) {
      Alert.action({id: id}, {action: 'shelve', text: 'status change via console' + byUser, timeout: timeout}, function(data) {
        $route.reload();
      });
    };

    $scope.unshelveAlert = function(id, user) {
      Alert.action({id: id}, {action: 'unshelve', text: 'status change via console' + byUser}, function(data) {
        $route.reload();
      });
    };

    $scope.closeAlert = function(id) {
      Alert.action({id: id}, {action: 'close', text: 'status change via console' + byUser}, function(data) {
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

    $scope.shortTime = config.dates && config.dates.shortTime || 'HH:mm';
    $scope.longDate = config.dates && config.dates.longDate || 'd/M/yyyy h:mm:ss.sss a';
  }]);

alertaControllers.controller('AlertTop10Controller', ['$scope', '$location', '$timeout', 'Count', 'Environment', 'Service', 'Alert', 'Top10',
  function($scope, $location, $timeout, Count, Environment, Service, Alert, Top10){

    $scope.autoRefresh = true;
    $scope.refreshText = 'Auto Update';

    var search = $location.search();
    if (search.environment) {
      $scope.environment = search.environment;
    }
    if (search.service) {
      $scope.service = search.service;
    }

    $scope.show = [
      {name: 'Open', value: ['open', 'unknown']},
      {name: 'Active', value: ['open', 'ack', 'assign']},
      {name: 'Closed', value: ['closed', 'expired']}
    ];
    $scope.status = $scope.show[0];

    $scope.top10 = [];
    $scope.flapping = [];
    $scope.standing = [];
    $scope.query = {};

    $scope.setService = function(s) {
      if (s) {
        $scope.environment = s.environment;
        $scope.service = s.service;
      } else {
        $scope.environment = null;
        $scope.service = null;
      }
      updateQuery();
      refresh();
    };

    $scope.setEnv = function(environment) {
      $scope.environment = environment;
      updateQuery();
      refresh();
    };

    $scope.update = function() {
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
        $scope.query['status'] = $scope.status.value;
      } else {
        delete $scope.query['status'];
      }
      $location.search($scope.query);
    };

    Service.all({status: $scope.status.value}, function(response) {
      $scope.services = response.services;
    });

    var refresh = function() {
      $scope.refreshText = 'Refreshing...';
      Count.query({status: $scope.status.value}, function(response) {
        $scope.total = response.total;
        $scope.statusCounts = response.statusCounts;
      });
      // Service.all({status: $scope.status.value}, function(response) {
      //   $scope.services = response.services;
      // });
      Environment.all({status: $scope.status.value}, function(response) {
        $scope.environments = response.environments;
      });
      updateQuery();
      Top10.offenders($scope.query, function(response) {
        if (response.status == 'ok') {
          $scope.offenders = response.top10;
        }
        $scope.message = response.status + ' - ' + response.message;
        $scope.autoRefresh = response.autoRefresh;
        if ($scope.autoRefresh) {
          $scope.refreshText = 'Auto Update';
        } else {
          $scope.refreshText = 'Refresh';
        }
      });
      Top10.flapping($scope.query, function(response) {
        if (response.status == 'ok') {
          $scope.flapping = response.top10;
        }
      });
      Top10.standing($scope.query, function(response) {
        if (response.status == 'ok') {
          $scope.standing = response.top10;
        }
      });
    };
    var refreshWithTimeout = function() {
      if ($scope.autoRefresh) {
        refresh();
      }
      timer = $timeout(refreshWithTimeout, config.refresh_interval || 5000);
    };
    var timer = $timeout(refresh, 200);

    $scope.$on('$destroy', function() {
      if (timer) {
        $timeout.cancel(timer);
      }
    });

  }]);

alertaControllers.controller('AlertWatchController', ['$scope', '$route', '$location', '$timeout', '$auth',  'config', 'Alert',
  function($scope, $route, $location, $timeout, $auth,  config, Alert){

    var byUser = '';
    if ($auth.isAuthenticated()) {
      $scope.user = $auth.getPayload().name;
      byUser = ' by ' + $scope.user;
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

    $scope.colors = angular.merge(defaults, config.colors);

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
      if ($event.metaKey || $event.altKey) {
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
        Alert.status({id: id}, {status: 'open', text: 'bulk status change via console' + byUser}, function(data) {
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
        Alert.status({id: id}, {status: 'ack', text: 'bulk status change via console' + byUser}, function(data) {
          // $route.reload();
        });
      });
      $route.reload();
    };

    $scope.bulkCloseAlert = function(ids) {
      angular.forEach(ids, function(id) {
        Alert.status({id: id}, {status: 'closed', text: 'bulk status change via console' + byUser}, function(data) {
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

    $scope.bulkOpenTabAlert = function(ids) {
      angular.forEach(ids, function(id) {
        window.open('/#/alert/' + id, '_blank');
      });
    };

    $scope.shortTime = config.dates && config.dates.shortTime || 'HH:mm';
    $scope.mediumDate = config.dates && config.dates.mediumDate || 'EEE d MMM HH:mm';
  }]);

alertaControllers.controller('AlertBlackoutController', ['$scope', '$route', '$timeout', '$auth', 'config', 'Blackouts', 'Environment', 'Service', 'Customers',
  function($scope, $route, $timeout, $auth, config, Blackouts, Environment, Service, Customers) {

    $scope.blackouts = [];

    var now = new Date();
    now.setSeconds(0,0);
    $scope.start = now;
    $scope.end = new Date(now);
    $scope.end.setMinutes(now.getMinutes() + 60);

    Service.all({}, function(response) {
      $scope.services = response.services;
    });
    Environment.all({}, function(response) {
      $scope.environments = response.environments;
    });
    Customers.all({}, function(response) {
      $scope.customers = response.customers;
    });

    $scope.createBlackout = function(environment,service,resource,event,group,tags,customer,start,end) {
      if (service) {
        service = service.split(",");
      }
      if (tags) {
        tags = tags.split(",");
      }
      Blackouts.save({}, {environment: environment, service: service, resource: resource, event: event, group: group, tags: tags, customer: customer, startTime: start, endTime: end}, function(data) {
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

    $scope.mediumDate = config.dates && config.dates.mediumDate || 'EEE d MMM HH:mm';
  }]);


alertaControllers.controller('UserController', ['$scope', '$route', '$timeout', '$auth', 'config', 'Users', 'Perms',
  function($scope, $route, $timeout, $auth, config, Users, Perms) {

    $scope.domains = [];
    $scope.users = [];
    $scope.roles = [];

    Users.query(function(response) {
      $scope.domains = response.domains;
      $scope.users = response.users;
    });

    Perms.all(function(response) {
      $scope.roles = response.permissions.map(p => p.match);
      $scope.roles.push('user');  // add default 'user' role as option
    });

    $scope.updateRole = function(user, role) {
      Users.update({user: user}, {role: role}, function(data) {
        $route.reload();
      });
    };

    $scope.setEmailVerified = function(user) {
      Users.update({user: user}, {email_verified: true}, function(data) {
        $route.reload();
      });
    };

    $scope.deleteUser = function(user) {
      Users.delete({user: user}, {}, function(data) {
        $route.reload();
      });
    };

    $scope.longDate = config.dates && config.dates.longDate || 'd/M/yyyy h:mm:ss.sss a';
  }]);

alertaControllers.controller('PermissionsController', ['$scope', '$route', '$timeout', '$auth', 'Perms',
  function($scope, $route, $timeout, $auth, Perms) {

    $scope.perms = [];
    $scope.perm = '';
    $scope.match = '';

    $scope.createPerm = function(scope, match) {
      Perms.save({}, {scopes: scope.split(' '), match: match}, function(data) {
        $route.reload();
      }, function(e) {
        $scope.status = e.data.status;
        $scope.message = e.data.message;
      });
    };

    $scope.deletePerm = function(id) {
      Perms.delete({id: id}, {}, function(response) {
        $route.reload();
      });
    };

    Perms.all({}, function(response) {
      $scope.perms = response.permissions;
    });

  }]);

alertaControllers.controller('CustomerController', ['$scope', '$route', '$timeout', '$auth', 'Customers',
  function($scope, $route, $timeout, $auth, Customers) {

    $scope.customers = [];
    $scope.customer = '';
    $scope.match = '';

    $scope.createCustomer = function(customer, match) {
      Customers.save({}, {customer: customer, match: match}, function(data) {
        $route.reload();
      });
    };

    $scope.deleteCustomer = function(id) {
      Customers.delete({id: id}, {}, function(data) {
        $route.reload();
      });
    };

    Customers.all({}, function(response) {
      $scope.customers = response.customers;
    });

  }]);

alertaControllers.controller('ApiKeyController', ['$scope', '$route', '$timeout', '$auth', 'config', 'Keys',
  function($scope, $route, $timeout, $auth, config, Keys) {

    $scope.keys = [];
    $scope.type = {name: 'read-only', scopes: ['read']};
    $scope.text = '';

    $scope.types = [
      {name: 'admin', scopes: ['read', 'write', 'admin']},
      {name: 'read-write', scopes: ['read', 'write']},
      {name: 'read-only', scopes: ['read']}
    ];

    $scope.createKey = function(type, customer, text) {
      var login = $auth.getPayload().preferred_username || $auth.getPayload().login;
      Keys.save({}, {user: login, scopes: type.scopes, customer: customer, text: text}, function(data) {
        $route.reload();
      });
    };

    $scope.deleteKey = function(key) {
      Keys.delete({key: key}, {}, function(data) {
        $route.reload();
      });
    };

    Keys.query({}, function(response) {
      $scope.keys = response.keys;
    });

    $scope.longDate = config.dates && config.dates.longDate || 'd/M/yyyy h:mm:ss.sss a';
  }]);

alertaControllers.controller('ProfileController', ['$scope', '$auth',
  function($scope, $auth) {

    $scope.user_id = $auth.getPayload().sub;
    $scope.name = $auth.getPayload().name;
    $scope.login = $auth.getPayload().preferred_username || $auth.getPayload().login;
    $scope.provider = $auth.getPayload().provider;
    $scope.customers = $auth.getPayload().customers || $auth.getPayload().customer;
    $scope.role = $auth.getPayload().role;  // legacy role

    $scope.orgs = $auth.getPayload().orgs;
    $scope.groups = $auth.getPayload().groups;
    $scope.roles = $auth.getPayload().roles;
    $scope.scopes = ($auth.getPayload().scope || '').split(' ');

    $scope.token = $auth.getToken();
    $scope.payload = $auth.getPayload();
  }]);

alertaControllers.controller('HeartbeatsController', ['$scope', '$timeout', 'config', 'Heartbeat',
  function($scope, $timeout, config, Heartbeat) {

    $scope.heartbeats = [];

    var refresh = function() {
      Heartbeat.query(function(response) {
        $scope.heartbeats = response.heartbeats;
      });
      timer = $timeout(refresh, 10000);
    };
    var timer = $timeout(refresh, 200);

    $scope.$on('$destroy', function() {
      if (timer) {
        $timeout.cancel(timer);
      }
    });

    $scope.longDate = config.dates && config.dates.longDate || 'd/M/yyyy h:mm:ss.sss a';

    $scope.deleteHeartbeat = function(id) {
      Heartbeat.delete({id: id}, {}, refresh);
    };
  }]);

alertaControllers.controller('AboutController', ['$scope', '$timeout', 'config', 'Management',
  function($scope, $timeout, config, Management) {

    Management.manifest(function(response) {
      $scope.label = response.alerta ? response.alerta.label : 'Alerta API';
      $scope.release = response.alerta? response.alerta.release : response.release;
      $scope.build = response.alerta ? response.alerta.build : response.build;
      $scope.date = response.alerta ? response.alerta.date : response.date;
      $scope.revision = response.alerta? response.alerta.revision : response.revision;
    });

    $scope.metrics = [];
    $scope.heartbeats = [];

    var refresh = function() {
      Management.status(function(response) {
        $scope.metrics = response.metrics;
        $scope.lastTime = response.time;
        $scope.uptime = response.uptime;
      });
      timer = $timeout(refresh, 10000);
    };
    var timer = $timeout(refresh, 200);

    $scope.$on('$destroy', function() {
      if (timer) {
        $timeout.cancel(timer);
      }
    });

    $scope.longDate = config.dates && config.dates.longDate || 'd/M/yyyy h:mm:ss.sss a';
  }]);

alertaControllers.controller('LoginController', ['$scope', '$rootScope', '$location', '$auth', 'config',
 function($scope, $rootScope, $location, $auth, config) {

    $scope.provider = config.provider;

    $scope.login = function(email, password) {
      $auth.login({
        username: $scope.email,
        password: $scope.password
      })
        .then(function() {
          $rootScope.$broadcast('login:name', $auth.getPayload().name);
          $location.path('/');
        })
        .catch(function(e) {
          console.log(e);
          if (e.status == 401) {
            $scope.error = "Login failed.";
            $scope.message = e.data.message;
          };
          if (e.status == 403) {
            $scope.error = "User not authorized.";
            $scope.message = e.data.message;
          };
        });
    };
  }]);

alertaControllers.controller('SignupController', ['$scope', '$rootScope', '$location', '$auth', 'config',
 function($scope, $rootScope, $location, $auth, config) {

    $scope.provider = config.provider;

    $scope.signup = function(name, email, password, text) {
      $auth.signup({
        name: $scope.name,
        email: $scope.email,
        password: $scope.password,
        text: $scope.text
      })
        .then(function(response) {
          $auth.setToken(response);
          $rootScope.$broadcast('login:name', $scope.name);
          $location.path('/');
        })
        .catch(function(e) {
          console.log(e);
          if (e.status != 200) {
            $scope.error = "Sign up failed.";
            $scope.message = e.data.message;
          };
        });
      };
  }]);

  alertaControllers.controller('LogoutController', ['$auth', '$location',
    function($auth, $location) {
    if (!$auth.isAuthenticated()) {
        return;
    }
    $auth.logout()
      .then(function() {
        console.log('You have been logged out');
        $location.path('/');
      });
  }]);
