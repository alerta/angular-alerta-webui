'use strict';

angular.module('config', [])
  .constant('config', {
    'endpoint'    : "http://"+window.location.hostname+":8080",
    'provider'    : "google",
    'client_id'   : "379647311730-sj130ru952o3o7ig8u0ts8np2ojivr8d.apps.googleusercontent.com",
    // 'provider'    : "github",
    // 'client_id'   : "d0a9fbf5a3e21370c7bb",
    'redirect_url': "http://localhost/~nsatterl/angular-alerta-webui/app" // eg. "http://"+window.location.hostname
  });
