'use strict';

/* Filters */

var alertaFilters = angular.module('alertaFilters', []);

alertaFilters.filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    };
  }]);
