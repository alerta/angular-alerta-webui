'use strict';

var alerta = alerta || {};


angular.element(document).ready(function() {
  var configJsCheck = function() {
    $.ajax({
        url: 'config.js',
        type:'HEAD',
        success: function() {
          console.error(
            'ERROR: Configuration in config.js file is no longer supported. ' +
            'Use config.json file instead. See for more info: ' +
            'https://docs.alerta.io/en/latest/webui.html'
          );
        },
        error: function() {
          console.log(
            'INFO: Ignore 404 File not found errors for config.js files. ' +
            'Checking for deprecated configuration in config.js file. [OK]'
          );
        }
    });
  };

  var bootstrap = function() {
    alerta.loadRoutes();
    alerta.loadAuth();
    angular.bootstrap(document, ['alerta']);
  };

  $.getJSON('config.json').done(function(localConfig) {
    alerta.setConfig(localConfig);
  }).always(function(localConfig) {
    $.getJSON(localConfig.endpoint + '/config').done(function(remoteConfig) {
      alerta.setConfig(remoteConfig);
    })
    .then(function() {
      configJsCheck();
      bootstrap();
    });
  });
});

alerta.setConfig = function(data) {
  angular.module('alerta')
    .config(['configProvider', function(configProvider) {
      configProvider.setConfig(data);
    }]);
};
