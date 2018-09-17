'use strict';

var alerta = alerta || {};


angular.element(document).ready(function() {
    var bootstrap = function() {
        alerta.loadRoutes();
        alerta.loadAuth();
        angular.bootstrap(document, ['alerta']);
    };

    $.getJSON('config.json').done(function(localConfig) {
        alerta.setConfig(localConfig);
    }).always(function (localConfig) {
    $.getJSON(localConfig.endpoint+'/config').done(function(remoteConfig) {
        alerta.setConfig(remoteConfig);
    }).then(function () {
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
