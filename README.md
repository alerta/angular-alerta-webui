Alerta Web UI 3.0
=================

Version 3.0 of the alerta dashboard is an [AngularJS](http://angularjs.org/) web app that uses client-side templating.

It replaces alerta dashboard [version 2.0](https://github.com/alerta/alerta-dashboard) which still works, but is no longer under active development.

Example
-------

![dashboard](/docs/images/alerta-webui-v3.png?raw=true)


Installation
------------

In production, copy the files under the `app/` directory to a web server.


Configuration
-------------

By default, the dashboard will assume the alerta API endpoint is located at port 8080 on the same domain
that the dashboard is served from. That is:

    var config = {
      'alerta': "http://"+window.location.hostname+":8080"
    };

Modify the file `app/js/services.js` to use a different alert API endpoint. For example:

    var config = {
      'alerta': "http://api.alerta.io"
    };

Deploy to the Cloud
-------------------

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

Dependencies
------------

All dependencies are included, however, for reference they are:

  * [jQuery](http://jquery.com/)
  * [AngularJS](http://angularjs.org/)
  * [Bootstrap 3.0](http://getbootstrap.com/2.3.2/)
  * [Sintony Font](http://www.google.com/fonts/specimen/Sintony)
  

License
-------

Copyright (c) 2014 Nick Satterly. Available under the MIT License.

