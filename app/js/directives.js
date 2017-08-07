'use strict';

/* Directives */

var alertaDirectives = angular.module('alertaDirectives', []);

alertaDirectives.directive('googleAnalytics', ['config', function(config) {
  return {
    restrict: 'E',
    scope: {
      analyticsId: '&'
    },
    controller: function($scope) {
      $scope.trackingId = config.tracking_id;
    },
    link: function (scope, elem, attrs, ctrl) {
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
        ga('create', scope.trackingId, 'auto');
        ga('send', 'pageview');
    }
  };
}]);

alertaDirectives.directive('hasPermission', ['$auth', function($auth) {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs, ctrl) {
      function isInScope(s) {
        var scopes = $auth.isAuthenticated() ? ($auth.getPayload().scope || '').split(' ') : [];
        if (scopes.includes(s) || scopes.includes(s.split(':')[0])) {
          return true;
        } else if (s.startsWith('read')) {
          return isInScope(s.replace('read', 'write'));
        } else if (s.startsWith('write')) {
          return isInScope(s.replace('write', 'admin'))
        }
      }

      scope.$watch('hasPermission', function(perm) {
        if (isInScope(attrs.hasPermission)) {
          elem.removeClass('ng-hide');
        } else {
          elem.addClass('ng-hide');
        }
      });
    }
  }
}]);
