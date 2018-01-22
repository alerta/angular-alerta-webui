var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.get('/config.js', function(request, response) {

  var config = " \
    'use strict'; \
    angular.module('config', []) \
      .constant('config', { \
        'endpoint'    : '" + process.env.ALERTA_ENDPOINT + "', \
        'provider'    : '" + process.env.PROVIDER + "', \
        'client_id'   : '" + process.env.CLIENT_ID + "', \
        'github_url'  : '" + (process.env.GITHUB_URL || 'https://github.com') + "', \
        'gitlab_url'  : '" + process.env.GITLAB_URL + "', \
        'tracking_id' : '" + process.env.TRACKING_ID + "' \
      });";

  response.send(config);
});
app.use(express.static(__dirname + '/app'));

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
