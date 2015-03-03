'use strict';

angular.module('config', [])
  .constant('config', {
    // 'endpoint'    : "http://"+window.location.hostname+":8080",
    'endpoint'    : "http://localhost:8080",
    'provider'    : "github", // google or github
    // 'client_id'   : "379647311730-sj130ru952o3o7ig8u0ts8np2ojivr8d.apps.googleusercontent.com"
    'client_id'   : "1ff8c23b32608d8a06bc"
  });
