'use strict';

angular.module('config', [])
  .constant('config', {
    // 'endpoint'    : "http://"+window.location.hostname+":8080",
    'endpoint'    : "http://api.alerta.io",
    'provider'    : "google", // google or github
    'client_id'   : "744241357326-2m37jti56hjvapc1137la03d27pnpoa1.apps.googleusercontent.com"
  });
