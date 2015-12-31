Alerta Web UI 3.0
=================

Version 3.0 of the alerta dashboard is an [AngularJS](http://angularjs.org/) web app that uses client-side templating.

It replaces alerta dashboard [version 2.0](https://github.com/alerta/alerta-dashboard) which still works, but is no longer under active development.

Example
-------

![dashboard](/docs/images/alerta-webui-v3.png?raw=true&v=1)


Installation
------------

In production, copy the files under the `app/` directory to a web server.


Configuration
-------------

By default, the dashboard will assume the alerta API endpoint is located at port 8080 on the same domain that the dashboard is served from. If the API endpoint is at a non-default location modify the `config.js` file:

    'use strict';

    angular.module('config', [])
      .constant('config', {
        'endpoint'    : "http://"+window.location.hostname+":8080",
        'provider'    : "basic", // google, github, gitlab or basic
        'client_id'   : "INSERT-CLIENT-ID-HERE"
      });

Also, if the Alerta API has set `AUTH_REQUIRED` to `True` then set the `provider` and `client_id` accordingly.

Server Configuration
--------------------

Ensure the Alerta API server configuration is updated to include the web UI address in the `CORS_ORIGINS` setting:

    CORS_ORIGINS = [
        'http://web.example.com'
    ]

Deploy to the Cloud
-------------------

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

Dependencies
------------

All dependencies are included, however, for reference they are:

  * [jQuery](http://jquery.com/)
  * [AngularJS](http://angularjs.org/)
  * [Bootstrap 3.0](http://getbootstrap.com/2.3.2/)
  * [Satellizer OAuth library](https://github.com/sahat/satellizer)
  * [Sintony Font](http://www.google.com/fonts/specimen/Sintony)


License
-------

Copyright (c) 2015 Nick Satterly. Available under the MIT License.

