'use strict';

/* Filters */

var alertaFilters = angular.module('alertaFilters', []);

alertaFilters.filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    };
  }]);

alertaFilters.filter('capitalize', function() {
  return function(text) {
    return String(text).replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); });
  };
});
