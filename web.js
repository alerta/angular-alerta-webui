var express = require('express');
var app = express();

var forceSsl = function (req, res, next) {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    res.header("Strict-Transport-Security", "max-age=31536000");
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  }
  return next();
};

app.set('port', (process.env.PORT || 5000));

app.use(forceSsl);
app.get('/config.json', function(request, response) {

  var config = {
    endpoint: process.env.ALERTA_ENDPOINT
  }
  response.send(JSON.stringify(config));
});
app.use(express.static(__dirname + '/app'));

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
