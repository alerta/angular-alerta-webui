'use strict';

angular.module('config', [])
  .constant('config', {
    'endpoint'    : "http://"+window.location.hostname+":8080",
    'provider'    : "basic", // google, github, gitlab, twitter or basic
    'client_id'   : "INSERT-CLIENT-ID-HERE",
    'gitlab_url'  : "INSERT-GITLAB-URL-HERE"  // for gitlab provider only
  })
  .constant('colors', {}); // use default colors
