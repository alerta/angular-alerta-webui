'use strict';

angular.module('alertaApp')

  .provider('config', function ConfigProvider() {
    var defaults = this.defaults = {};
    this.initialize = function(localConfig, remoteConfig) {
      this.config = angular.merge({}, defaults, remoteConfig, localConfig);
    };
    this.$get = ['$locale', function() {
      config.locale = $locale;
      return this.config;
    }];
});
