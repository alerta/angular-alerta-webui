'use strict';

angular.module('config', [])
  .constant('config', {
    'endpoint'    : "http://"+window.location.hostname+":8080",
    'provider'    : "basic", // google, github, gitlab or basic
    'client_id'   : "INSERT-CLIENT-ID-HERE",
    'gitlab_url'  : "https://gitlab.com",  // replace with your gitlab server
    'colors'      : {}, // use default colors, remove colors_css property below to use it
    // alternative way of overriding colors
    'colors_css': `
      .alert-row-critical {
        background-color: red;
        color: white;
      }
      .alert-row-major {
        background-color: orange;
        color: black;
      }
      .alert-row-minor {
        background-color: yellow;
        color: black;
      }
      .alert-row-warning {
        background-color: #1E90FF;
        color: white;
      }
      .alert-row-indeterminate {
        background-color: silver;
        color: black;
      }
      .alert-row-cleared {
        background-color: #00CC00;
        color: black;
      }
      .alert-row-normal {
        background-color: #00CC00;
        color: black;
      }
      .alert-row-ok {
        background-color: #00CC00;
        color: black;
      }
      .alert-row-informational {
        background-color: #00CC00;
        color: black;
      }
      .alert-row-debug {
        background-color: #7554BF;
        color: white;
      }
      .alert-row-security {
        background-color: black;
        color: white;
      }
      .alert-row-unknown {
        background-color: silver;
        color: black;
      }
      .alert-row-highlighted {
        background-color: skyblue;
        color: black;
      }`,
    'severity'    : {}, // use default severity codes
    'audio'       : {}, // no audio
    'tracking_id' : ""  // Google Analytics tracking ID eg. UA-NNNNNN-N
  });
