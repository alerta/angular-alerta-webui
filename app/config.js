'use strict';

angular.module('config', [])

  .constant('config', {

    'endpoint'    : "http://"+window.location.hostname+":8080",

    'client_id'   : '379647311730-hn94fk7lss64ohvs1ddc01sauuspeeea.apps.googleusercontent.com',

    //'redirect_url': "http://"+window.location.hostname+"/oauth2callback.html"
    'redirect_url': "http://"+window.location.hostname+"/~nsatterl/angular-alerta-webui/app/oauth2callback.html"

  });




