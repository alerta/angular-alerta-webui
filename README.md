Alerta Web UI 6.0
=================

Version 6.0 of the Alerta dashboard is an [AngularJS](http://angularjs.org/) web app that uses client-side templating.

![dashboard](/docs/images/alerta-webui-v3.png?raw=true&v=1)

AngularJS is EOL
----------------

As of July 1, 2018 active development of AngularJS has stopped and version 1.7
has entered in to a [Long Term Support Period which will last 3 years](https://blog.angular.io/stable-angularjs-and-long-term-support-7e077635ee9c).

Alerta Web UI uses AngularJS 1.5 which was last updated in January 2017 and is
not an LTS version so will not receive any security patches or updates.

Migrating this application directly to Angular (2+) is not possible as Angular
is a significantly different framework. A [rewrite of the web UI is in progress](https://github.com/alerta/beta.alerta.io)
and as such, this version is now in "maintenance mode" and no further feature
enhancements will be accepted. Only security patches or critical bug fixes
will be considered from January 31, 2019.

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