'use strict';

angular.module('alerta')
  .provider('config', function configProvider() {
    var config = {};

    this.setConfig = function(data) {
      angular.merge(config, data);
    };

    this.getConfig = function() {
      return config;
    };

    this.$get = function() {
      return config;
    };
  });
