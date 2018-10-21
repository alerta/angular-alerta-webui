'use strict';

/* Controllers */

angular.module('alerta')

  .controller('MenuController', ['$scope', '$rootScope', '$location', '$auth', 'config',
    function($scope, $rootScope, $location, $auth, config) {

      $scope.authRequired = config.auth_required;
      $scope.siteLogoUrl = config.site_logo_url;

      if ($auth.isAuthenticated()) {
        $scope.name = $auth.getPayload().name;
      };

      $scope.$on('login:name', function(evt, name) {
        $scope.name = name;
      });

      $scope.isActive = function(viewLocation) {
        return viewLocation === $location.path();
      };

      $scope.isSearchable = function() {
        var searchableViews = [
          '/alerts',
          '/watch',
        ];
        return searchableViews.indexOf($location.path()) > -1;
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
        if (!$scope.authRequired) { return true; }
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
          }, {
            once: true
          });
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

      $scope.updateSearch = function(q) {
        $rootScope.$broadcast('search:q', q);
      };
    }
  ])

  .controller('AlertListController', ['$scope', '$route', '$location', '$timeout', '$auth', 'config', 'Count', 'Environment', 'Service', 'Alert',
    function($scope, $route, $location, $timeout, $auth, config, Count, Environment, Service, Alert) {

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

      $scope.show = [{
          name: 'Open',
          value: ['open', 'unknown']
        },
        {
          name: 'Active',
          value: ['open', 'ack', 'assign']
        },
        {
          name: 'Shelved',
          value: ['shelved']
        },
        {
          name: 'Closed',
          value: ['closed', 'expired']
        },
        {
          name: 'Blackout',
          value: ['blackout']
        }
      ];

      if (search.status) {
        $scope.status = {
          name: '',
          value: search.status
        };
      } else {
        $scope.status = $scope.show[0];
      }

      $scope.alerts = [];
      $scope.alertLimit = 20;

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

      $scope.$on('search:q', function(evt, q) {
        $scope.q = q;
        refresh();
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
          $scope.query['status'] = $scope.status.value;
        } else {
          delete $scope.query['status'];
        }
        if ($scope.q) {
          $scope.query['q'] = $scope.q;
        } else {
          delete $scope.query['q'];
        }
        $location.search($scope.query);
      };

      Service.all({
        status: $scope.status.value
      }, function(response) {
        $scope.services = response.services;
      });

      var refresh = function() {
        $scope.refreshText = 'Refreshing...';
        updateQuery();
        Count.query($scope.query, function(response) {
          $scope.total = response.total;
          $scope.statusCounts = response.statusCounts;
        });
        // Service.all({status: $scope.status.value}, function(response) {
        //   $scope.services = response.services;
        // });
        Environment.all({
          status: $scope.status.value
        }, function(response) {
          $scope.environments = response.environments;
        });
        Environment.all($scope.query, function(response) {
          $scope.envCounts = response.environments.reduce((c, e) => { c[e.environment] = e.count; return c; }, {});
        });
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

      $scope.columns = config.columns;

      $scope.sortByTime = config.sort_by || 'lastReceiveTime';
      $scope.sortByTimeField = $scope.sortByTime.replace(/^\-/,'');

      if ($scope.sortByTime.startsWith('-')) {
        $scope.query = {
          'sort-by': $scope.sortByTimeField,
          'reverse': 1
        }
      } else {
        $scope.query = {
          'sort-by': $scope.sortByTimeField
        }
      };

      $scope.predicate = [$scope.reverseSeverityCode, $scope.sortByTime];
      $scope.reverse = true;

      $scope.toggleSort = function(col) {
        $scope.predicate = col;
        $scope.reverse = !$scope.reverse;
      };

      $scope.$watch('alerts', function(current, old) {
        if (current.length > old.length && $scope.status.value.indexOf('open') > -1) {
          $scope.play = true;
        } else {
          $scope.play = false;
        }
      });

      $scope.bulkAlerts = [];

      $scope.click = function($event, alert) {
        if ($event.metaKey || $event.altKey) {
          var index = $scope.bulkAlerts.indexOf(alert.id);
          if (index > -1) {
            $scope.bulkAlerts.splice(index, 1);
          } else {
            $scope.bulkAlerts.push(alert.id);
          }
        } else if (!$event.ctrlKey) {
          $location.url('/alert/' + alert.id);
        } else if ($event.ctrlKey) {
          window.open('/#/alert' + alert.id, '_blank');
        }
      };

      $scope.bulkOpenAlert = function(ids) {
        angular.forEach(ids, function(id) {
          Alert.status({
            id: id
          }, {
            status: 'open',
            text: 'bulk status change via console' + byUser
          }, function(data) {
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
          Alert.tag({
            id: id
          }, {
            tags: ['watch:' + user]
          }, function(data) {
            // $route.reload();
          });
        });
        $route.reload();
      };

      $scope.bulkUnwatchAlert = function(ids, user) {
        angular.forEach(ids, function(id) {
          Alert.untag({
            id: id
          }, {
            tags: ['watch:' + user]
          }, function(data) {
            // $route.reload();
          });
        });
        $route.reload();
      };

      $scope.bulkAckAlert = function(ids) {
        angular.forEach(ids, function(id) {
          Alert.status({
            id: id
          }, {
            status: 'ack',
            text: 'bulk status change via console' + byUser
          }, function(data) {
            // $route.reload();
          });
        });
        $route.reload();
      };

      $scope.bulkCloseAlert = function(ids) {
        angular.forEach(ids, function(id) {
          Alert.status({
            id: id
          }, {
            status: 'closed',
            text: 'bulk status change via console' + byUser
          }, function(data) {
            // $route.reload();
          });
        });
        $route.reload();
      };

      $scope.bulkDeleteAlert = function(ids) {
        angular.forEach(ids, function(id) {
          Alert.delete({
            id: id
          }, {}, function(data) {
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
    }
  ])

  .controller('AlertDetailController', ['$scope', '$route', '$routeParams', '$location', '$auth', 'config', 'Alert',
    function($scope, $route, $routeParams, $location, $auth, config, Alert) {

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

      Alert.get({
        id: $routeParams.id
      }, function(response) {
        $scope.alert = response.alert;
      });

      $scope.unackAlert = function(id) {
        Alert.action({
          id: id
        }, {
          action: 'unack',
          text: 'status change via console' + byUser
        }, function(data) {
          $route.reload();
        });
      };

      // $scope.tagAlert = function(id, tags) {
      //   Alert.tag({id: id}, {tags: tags}, function(data) {
      //     $route.reload();
      //   });
      // };

      $scope.watchAlert = function(id, user) {
        Alert.tag({
          id: id
        }, {
          tags: ['watch:' + user]
        }, function(data) {
          $route.reload();
        });
      };

      $scope.unwatchAlert = function(id, user) {
        Alert.untag({
          id: id
        }, {
          tags: ['watch:' + user]
        }, function(data) {
          $route.reload();
        });
      };

      $scope.ackAlert = function(id) {
        Alert.action({
          id: id
        }, {
          action: 'ack',
          text: 'status change via console' + byUser
        }, function(data) {
          $route.reload();
        });
      };

      $scope.shelveAlert = function(id, user, timeout) {
        Alert.action({
          id: id
        }, {
          action: 'shelve',
          text: 'status change via console' + byUser,
          timeout: timeout
        }, function(data) {
          $route.reload();
        });
      };

      $scope.unshelveAlert = function(id, user) {
        Alert.action({
          id: id
        }, {
          action: 'unshelve',
          text: 'status change via console' + byUser
        }, function(data) {
          $route.reload();
        });
      };

      $scope.closeAlert = function(id) {
        Alert.action({
          id: id
        }, {
          action: 'close',
          text: 'status change via console' + byUser
        }, function(data) {
          $route.reload();
        });
      };

      $scope.deleteAlert = function(id) {
        Alert.delete({
          id: id
        }, {}, function(data) {
          $location.path('/');
        });
      };

      $scope.actions = config.actions;

      $scope.actionAlert = function(id, action) {
        Alert.action({
          id: id
        }, {
          action: action,
          text: action + byUser
        }, function(data) {
          $route.reload();
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
    }
  ])

  .controller('AlertTop10Controller', ['$scope', '$location', '$timeout', 'config', 'Count', 'Environment', 'Service', 'Alert', 'Top10',
    function($scope, $location, $timeout, config, Count, Environment, Service, Alert, Top10) {

      $scope.autoRefresh = true;
      $scope.refreshText = 'Auto Update';

      var search = $location.search();
      if (search.environment) {
        $scope.environment = search.environment;
      }
      if (search.service) {
        $scope.service = search.service;
      }

      $scope.show = [{
          name: 'Open',
          value: ['open', 'unknown']
        },
        {
          name: 'Active',
          value: ['open', 'ack', 'assign']
        },
        {
          name: 'Shelved',
          value: ['shelved']
        },
        {
          name: 'Closed',
          value: ['closed', 'expired']
        },
        {
          name: 'Blackout',
          value: ['blackout']
        }
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

      Service.all({
        status: $scope.status.value
      }, function(response) {
        $scope.services = response.services;
      });

      var refresh = function() {
        $scope.refreshText = 'Refreshing...';
        Count.query({
          status: $scope.status.value
        }, function(response) {
          $scope.total = response.total;
          $scope.statusCounts = response.statusCounts;
        });
        // Service.all({status: $scope.status.value}, function(response) {
        //   $scope.services = response.services;
        // });
        Environment.all({
          status: $scope.status.value
        }, function(response) {
          $scope.environments = response.environments;
        });
        updateQuery();
        Top10.offenders($scope.query, function(response) {
          if (response.status == 'ok') {
            $scope.offenders = response.top10;
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

    }
  ])

  .controller('AlertWatchController', ['$scope', '$route', '$location', '$timeout', '$auth', 'config', 'Count', 'Environment', 'Service', 'Alert',
    function($scope, $route, $location, $timeout, $auth, config, Count, Environment, Service, Alert) {

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

      $scope.show = [{
          name: 'Open',
          value: ['open', 'unknown']
        },
        {
          name: 'Active',
          value: ['open', 'ack', 'assign']
        },
        {
          name: 'Shelved',
          value: ['shelved']
        },
        {
          name: 'Closed',
          value: ['closed', 'expired']
        },
        {
          name: 'Blackout',
          value: ['blackout']
        }
      ];

      if (search.status) {
        $scope.status = {
          name: '',
          value: search.status
        };
      } else {
        $scope.status = $scope.show[0];
      }

      $scope.watches = [];
      $scope.alertLimit = 20;

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

      $scope.$on('search:q', function(evt, q) {
        $scope.q = q;
        refresh();
      });

      var updateQuery = function() {
        $scope.query['tags'] = 'watch:' + $auth.getPayload().name
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
        if ($scope.q) {
          $scope.query['q'] = $scope.q;
        } else {
          delete $scope.query['q'];
        }
        $location.search($scope.query);
      };

      Service.all({
        status: $scope.status.value
      }, function(response) {
        $scope.services = response.services;
      });

      var refresh = function() {
        $scope.refreshText = 'Refreshing...';
        updateQuery();
        Count.query($scope.query, function(response) {
          $scope.total = response.total;
          $scope.statusCounts = response.statusCounts;
        });
        // Service.all({status: $scope.status.value}, function(response) {
        //   $scope.services = response.services;
        // });
        Environment.all({
          status: $scope.status.value
        }, function(response) {
          $scope.environments = response.environments;
        });
        Environment.all($scope.query, function(response) {
          $scope.envCounts = response.environments.reduce((c, e) => { c[e.environment] = e.count; return c; }, {});
        });
        Alert.query($scope.query, function(response) {
          if (response.status == 'ok') {
            $scope.watches = response.alerts;
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

      $scope.columns = config.columns;

      $scope.sortByTime = config.sort_by || 'lastReceiveTime';
      $scope.sortByTimeField = $scope.sortByTime.replace(/^\-/,'');

      if ($scope.sortByTime.startsWith('-')) {
        $scope.query = {
          'sort-by': $scope.sortByTimeField,
          'reverse': 1
        }
      } else {
        $scope.query = {
          'sort-by': $scope.sortByTimeField
        }
      };

      $scope.predicate = [$scope.reverseSeverityCode, $scope.sortByTime];
      $scope.reverse = true;

      $scope.toggleSort = function(col) {
        $scope.predicate = col;
        $scope.reverse = !$scope.reverse;
      };

      $scope.$watch('watches', function(current, old) {
        if (old && current && current.length > old.length && $scope.status.value.indexOf('open') > -1) {
          $scope.play = true;
        } else {
          $scope.play = false;
        }
      });

      $scope.bulkAlerts = [];

      $scope.click = function($event, alert) {
        if ($event.metaKey || $event.altKey) {
          var index = $scope.bulkAlerts.indexOf(alert.id);
          if (index > -1) {
            $scope.bulkAlerts.splice(index, 1);
          } else {
            $scope.bulkAlerts.push(alert.id);
          }
        } else if (!$event.ctrlKey) {
          $location.url('/alert/' + alert.id);
        } else if ($event.ctrlKey) {
          window.open('/#/alert' + alert.id, '_blank');
        }
      };

      $scope.bulkOpenAlert = function(ids) {
        angular.forEach(ids, function(id) {
          Alert.status({
            id: id
          }, {
            status: 'open',
            text: 'bulk status change via console' + byUser
          }, function(data) {
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
          Alert.tag({
            id: id
          }, {
            tags: ['watch:' + user]
          }, function(data) {
            // $route.reload();
          });
        });
        $route.reload();
      };

      $scope.bulkUnwatchAlert = function(ids, user) {
        angular.forEach(ids, function(id) {
          Alert.untag({
            id: id
          }, {
            tags: ['watch:' + user]
          }, function(data) {
            // $route.reload();
          });
        });
        $route.reload();
      };

      $scope.bulkAckAlert = function(ids) {
        angular.forEach(ids, function(id) {
          Alert.status({
            id: id
          }, {
            status: 'ack',
            text: 'bulk status change via console' + byUser
          }, function(data) {
            // $route.reload();
          });
        });
        $route.reload();
      };

      $scope.bulkCloseAlert = function(ids) {
        angular.forEach(ids, function(id) {
          Alert.status({
            id: id
          }, {
            status: 'closed',
            text: 'bulk status change via console' + byUser
          }, function(data) {
            // $route.reload();
          });
        });
        $route.reload();
      };

      $scope.bulkDeleteAlert = function(ids) {
        angular.forEach(ids, function(id) {
          Alert.delete({
            id: id
          }, {}, function(data) {
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
    }
  ])

  .controller('AlertBlackoutController', ['$scope', '$route', '$timeout', '$auth', 'config', 'Blackouts', 'Environment', 'Service', 'Customers',
    function($scope, $route, $timeout, $auth, config, Blackouts, Environment, Service, Customers) {

      $scope.blackouts = [];

      var now = new Date();
      now.setSeconds(0, 0);
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

      $scope.createBlackout = function(environment, service, resource, event, group, tags, customer, start, end, text) {
        if (service) {
          service = service.split(",");
        }
        if (tags) {
          tags = tags.split(",");
        }
        Blackouts.save({}, {
          environment: environment,
          service: service,
          resource: resource,
          event: event,
          group: group,
          tags: tags,
          customer: customer,
          startTime: start,
          endTime: end,
          text: text
        }, function(data) {
          $route.reload();
        });
      };

      $scope.deleteBlackout = function(id) {
        Blackouts.delete({
          id: id
        }, {}, function(data) {
          $route.reload();
        });
      };

      Blackouts.query({}, function(response) {
        $scope.blackouts = response.blackouts;
      });

      $scope.mediumDate = config.dates && config.dates.mediumDate || 'EEE d MMM HH:mm';
    }
  ])


  .controller('UserController', ['$scope', '$route', '$timeout', '$auth', 'config', 'Users', 'Perms',
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
        $scope.roles.push('user'); // add default 'user' role as option
      });

      $scope.updateRole = function(user, role) {
        Users.update({
          user: user
        }, {
          role: role
        }, function(data) {
          $route.reload();
        });
      };

      $scope.setEmailVerified = function(user) {
        Users.update({
          user: user
        }, {
          email_verified: true
        }, function(data) {
          $route.reload();
        });
      };

      $scope.createUser = function(name, email, password, text) {
        Users.save({}, {
          name: name,
          email: email,
          password: password,
          text: text
        }, function(data) {
          $route.reload();
        });
      };

      $scope.deleteUser = function(user) {
        Users.delete({
          user: user
        }, {}, function(data) {
          $route.reload();
        });
      };

      $scope.longDate = config.dates && config.dates.longDate || 'd/M/yyyy h:mm:ss.sss a';
    }
  ])

  .controller('PermissionsController', ['$scope', '$route', '$timeout', '$auth', 'Perms',
    function($scope, $route, $timeout, $auth, Perms) {

      $scope.perms = [];
      $scope.perm = '';
      $scope.scope = '';
      $scope.match = '';

      $scope.createPerm = function(scope, match) {
        Perms.save({}, {
          scopes: scope.split(' '),
          match: match
        }, function(data) {
          $route.reload();
        }, function(e) {
          $scope.status = e.data.status;
          $scope.message = e.data.message;
        });
      };

      $scope.deletePerm = function(id) {
        Perms.delete({
          id: id
        }, {}, function(response) {
          $route.reload();
        });
      };

      Perms.all({}, function(response) {
        $scope.perms = response.permissions;
      });

    }
  ])

  .controller('CustomerController', ['$scope', '$route', '$timeout', '$auth', 'Customers',
    function($scope, $route, $timeout, $auth, Customers) {

      $scope.customers = [];
      $scope.customer = '';
      $scope.match = '';

      $scope.createCustomer = function(customer, match) {
        Customers.save({}, {
          customer: customer,
          match: match
        }, function(data) {
          $route.reload();
        });
      };

      $scope.deleteCustomer = function(id) {
        Customers.delete({
          id: id
        }, {}, function(data) {
          $route.reload();
        });
      };

      Customers.all({}, function(response) {
        $scope.customers = response.customers;
      });

    }
  ])

  .controller('ApiKeyController', ['$scope', '$route', '$timeout', '$auth', 'config', 'Keys',
    function($scope, $route, $timeout, $auth, config, Keys) {

      $scope.keys = [];
      $scope.scope = ''
      $scope.text = '';

      $scope.createKey = function(scope, customer, text) {
        var login = $auth.getPayload().preferred_username || $auth.getPayload().login;
        Keys.save({}, {
          user: login,
          scopes: scope.split(' '),
          customer: customer,
          text: text
        }, function(data) {
          $route.reload();
        });
      };

      $scope.deleteKey = function(key) {
        Keys.delete({
          key: key
        }, {}, function(data) {
          $route.reload();
        });
      };

      Keys.query({}, function(response) {
        $scope.keys = response.keys;
      });

      $scope.longDate = config.dates && config.dates.longDate || 'd/M/yyyy h:mm:ss.sss a';
    }
  ])

  .controller('ProfileController', ['$scope', '$auth',
    function($scope, $auth) {

      $scope.payload = $auth.getPayload();
      $scope.token = $auth.getToken();
    }
  ])

  .controller('HeartbeatsController', ['$scope', '$timeout', 'config', 'Heartbeat',
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
        Heartbeat.delete({
          id: id
        }, {}, refresh);
      };
    }
  ])

  .controller('AboutController', ['$scope', '$timeout', 'config', 'Management',
    function($scope, $timeout, config, Management) {

      Management.manifest(function(response) {
        $scope.label = response.alerta ? response.alerta.label : 'Alerta API';
        $scope.release = response.alerta ? response.alerta.release : response.release;
        $scope.build = response.alerta ? response.alerta.build : response.build;
        $scope.date = response.alerta ? response.alerta.date : response.date;
        $scope.revision = response.alerta ? response.alerta.revision : response.revision;
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
    }
  ])

  .controller('LoginController', ['$scope', '$rootScope', '$location', '$auth', 'config',
    function($scope, $rootScope, $location, $auth, config) {

      $scope.provider = config.provider;
      $scope.signup_enabled = config.signup_enabled;

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
    }
  ])

  .controller('SignupController', ['$scope', '$rootScope', '$location', '$auth', 'config',
    function($scope, $rootScope, $location, $auth, config) {

      $scope.provider = config.provider;
      $scope.signup_enabled = config.signup_enabled || true;

      $scope.signup = function(name, email, password, text) {
        $auth.signup({
            name: name,
            email: email,
            password: password,
            text: text
          })
          .then(function(r) {
            $auth.setToken(r);
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
    }
  ])

  .controller('ConfirmController', ['$scope', '$routeParams', 'Auth',
  function($scope, $routeParams, Auth) {

      Auth.confirm({token: $routeParams.token}, {}).$promise
      .then(function(r) {
        $scope.error = null;
        $scope.message = r.message;
      })
      .catch(function(e) {
        console.log(e);
        $scope.error = "Email verification failed.";
        $scope.message = e.data.message;
      });
  }])

  .controller('ForgotController', ['$scope', 'config', 'Auth',
  function($scope, config, Auth) {

    $scope.provider = config.provider;
    $scope.message = null;

    $scope.forgot = function(email) {
      Auth.forgot({}, {email: email}).$promise
      .then(function(r) {
        $scope.error = null;
        $scope.message = r.message;
      })
      .catch(function(e) {
        console.log(e);
        $scope.error = "Reset request failed.";
        $scope.message = e.data.message;
      });
    };
  }])

  .controller('ResetController', ['$scope', '$routeParams', 'config', 'Auth',
  function($scope, $routeParams, config, Auth) {

    $scope.provider = config.provider;

    $scope.reset = function(password) {
      Auth.reset({token: $routeParams.token}, {password: password}).$promise
      .then(function(r) {
        $scope.error = null;
        $scope.message = r.message;
        $scope.success = true;
      })
      .catch(function(e) {
        console.log(e);
        $scope.error = "Password reset failed.";
        $scope.message = e.data.message;
      });
    };
  }])

  .controller('LogoutController', ['$auth', '$location',
    function($auth, $location) {
      if (!$auth.isAuthenticated()) {
        return;
      }
      $auth.logout()
        .then(function() {
          console.log('You have been logged out');
          $location.path('/');
        });
    }
  ]);
