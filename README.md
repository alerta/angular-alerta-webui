Alerta Web UI 3.0
=================

Version 3.0 of the alerta dashboard is an [AngularJS](http://angularjs.org/) web app that uses client-side templating.

It replaces Version 2.0 which still works, but is no longer under active development.

Example
-------

![dashboard](/docs/images/alerta-dashboard-v2.png?raw=true)


Installation
------------

To install the v2 dashboard, clone the repository and run:

    $ sudo python setup.py install


Configuration
-------------

By default, the dashboard will assume the alerta API endpoint is located at port 8080 on the same domain
that the dashboard is served from ie. `http://localhost:8080` if the dashboard is at `http://localhost:5000`

Modify file `dashboard/assets/js/config.js` to use a different alerta API endpoint. For example:

    var appConfig = {
        'endpoint': 'http://api.alerta.io:8080'
    }


Run
---

To run the dashboard in development, simply run `alerta-dashboard` on the command-line:

    $ alerta-dashboard
    # => http://localhost:5000/dashboard/index.html

In production, the only files needed are all those under the `app/` directory. Everything else can be omited.


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

