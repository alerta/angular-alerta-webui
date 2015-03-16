'use strict';

angular.module('config', [])
  .constant('config', {
    'endpoint'    : "http://"+window.location.hostname+":8080",
    'provider'    : "google", // google, github or twitter
    'client_id'   : "INSERT-CLIENT-ID-HERE"
  });
