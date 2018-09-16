'use strict';

var alertaApp = alertaApp || {};

angular.element(document).ready(function() {

    var bootstrap = function() {
        console.log('routes');
        alertaApp.loadRoutes();
        console.log('bootstrap');
        angular.bootstrap(document, ['alertaApp']);
    };

    $.get('config.json')
        .then(function(localConfig) {
            alertaApp.loadLocalConfig(localConfig);
            $.get(localConfig.endpoint).then(function(remoteConfig) {
                alertaApp.loadRemoteConfig(remoteConfig);
                bootstrap();
            })
        });
});

//angular.module('alertaApp')
//  .run(['config', function(config) {
//    console.log('config', config);
//  }]);


alertaApp.loadLocalConfig = function(data) {
    angular.module('alertaApp')
        .config(['configProvider', function(configProvider) {
            configProvider.init(data, {});
        }]);
};

alertaApp.loadRemoteConfig = function(data) {
    angular.module('alertaApp')
        .config(['configProvider', function(configProvider) {
            configProvider.init({}, data);
        }]);
};
