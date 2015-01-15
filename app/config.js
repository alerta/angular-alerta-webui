'use strict';

angular.module('config', [])
  .constant('config', {
    'endpoint'    : "http://"+window.location.hostname+":8080",
    'provider'    : "google", // google or github
    'client_id'   : "INSERT-OAUTH2-CLIENT-ID-HERE"
  });
