'use strict';

angular.module('config', [])
.constant('config', {
  'endpoint'    : "http://"+window.location.hostname+":8080",
  'provider'    : "basic", // google, github, twitter or basic
  'client_id'   : "INSERT-CLIENT-ID-HERE"
})
.constant('colors', {}); // use default colors
