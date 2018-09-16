'use strict';

angular.module('config', [])
  .provider('config', function ConfigProvider() {
    var defaults = this.defaults = {};
    this.initialize = function(localConfig, remoteConfig) {
      this.config = angular.merge(defaults, remoteConfig, localConfig);
    };
    this.$get = function() {
      return this.config;
    };
});
