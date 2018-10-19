'use strict';

angular.module('alerta')
  .provider('config', function configProvider() {

    var config = {};
    var localConfig = {};
    var remoteConfig = {};

    this.mergeConfig = function() {
      config = angular.merge({}, remoteConfig, localConfig);
    };

    this.setLocalConfig = function(data) {
      localConfig = data;
      this.mergeConfig();
    };

    this.setRemoteConfig = function(data) {
      remoteConfig = data;
      this.mergeConfig();
    };

    this.getConfig = function() {
      return config;
    };

    this.$get = function() {
      return config;
    };
  });
