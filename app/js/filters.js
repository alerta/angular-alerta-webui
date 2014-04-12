'use strict';

/* Filters */

var alertaFilters = angular.module('alertaFilters', []);

alertaFilters.filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    };
  }]);

alertaFilters.filter('arrow', function() {
  return function(trend) {
    if (trend == "noChange") {
        return 'minus'
    } else if (trend == "moreSevere") {
        return 'arrow-up'
    } else if (trend == "lessSevere") {
        return 'arrow-down'
    } else {
        return 'random'
    }
  };
});

alertaFilters.filter('capitalize', function() {
  return function(text) {
    return String(text).replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); });
  };
});

alertaFilters.filter('showing', function() {
  return function(input, limit) {
    if (!input) {
      return 'Showing 0 out of 0 alerts';
    }
    if (input > limit) {
      return 'Showing ' + limit + ' out of ' + input + ' alerts';
    } else {
      return 'Showing ' + input + ' out of ' + input + ' alerts';
    };
  };
});


