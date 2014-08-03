'use strict';

angular.module('config', [])

  .constant('config', {

    'endpoint'    : "http://"+window.location.hostname+":8080",

    'client_id'   : "CLIENT_ID",

    'redirect_url': "REDIRECT_URL" // eg. "http://"+window.location.hostname+"/oauth2callback.html"

  });




