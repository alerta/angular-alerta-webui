'use strict';

angular.module('config', [])
  .constant('config', {
    'endpoint'    : "http://"+window.location.hostname+":8080",
    'provider'    : "basic", // google, github, gitlab or basic
    'client_id'   : "INSERT-CLIENT-ID-HERE",
    'gitlab_url'  : "https://gitlab.com",  // replace with your gitlab server
    'colors'      : {}, // use default colors
    'severity'    : {}, // use default severity codes
    'audio'       : {}  // no audio
  });
