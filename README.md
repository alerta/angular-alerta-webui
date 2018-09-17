Alerta Web UI 6.0
=================

Version 6.0 of the Alerta dashboard is an [AngularJS](http://angularjs.org/) web app that uses client-side templating.

Example
-------

![dashboard](/docs/images/alerta-webui-v3.png?raw=true&v=1)

Installation
------------

In production, copy the files under the `app/` directory to a web server.

Configuration
-------------

By default, the dashboard will assume the Alerta API endpoint is located at port 8080 on the same domain that the dashboard is served from. If the API endpoint is at a non-default location create a `config.json` file:

```JSON
{
  "endpoint": "https://api.example.com"
}
```

All other settings are downloaded from the server when the client starts.

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
  * [AngularJS 1.x](http://angularjs.org/)
  * [Bootstrap 3](http://getbootstrap.com/)
  * [Satellizer OAuth library](https://github.com/sahat/satellizer)
  * [Sintony Font](http://www.google.com/fonts/specimen/Sintony)


License
-------

Copyright (c) 2015-2018 Nick Satterly. Available under the MIT License.