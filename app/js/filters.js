'use strict';

/* Filters */

angular.module('alerta')

  .filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    };
  }])

  .filter('arrow', function() {
    return function(trend) {
      if (trend == "noChange") {
        return 'minus'
      } else if (trend == "moreSevere") {
        return 'arrow-up'
      } else if (trend == "lessSevere") {
        return 'arrow-down'
      } else {
        return 'random'
      }
    };
  })

  .filter('capitalize', function() {
    return function(text) {
      return String(text).replace(/^./, function(str) {
        return str.toUpperCase();
      });
    };
  })

  .filter('splitcaps', function() {
    return function(text) {
      return String(text).replace(/([A-Z])/g, ' $1').replace(/^./, function(str) {
        return str.toUpperCase();
      });
    };
  })

  .filter('showing', function() {
    return function(input, limit) {
      if (!input) {
        return 'Showing 0 out of 0 alerts';
      }
      if (input > limit) {
        return 'Showing ' + limit + ' out of ' + input + ' alerts';
      } else {
        return 'Showing ' + input + ' out of ' + input + ' alerts';
      };
    };
  })

  .filter('since', function() {
    return function(input) {
      var diff = (new Date().getTime() - new Date(input).getTime()) / 1000;
      var mins = Math.floor(diff / 60);
      var secs = Math.floor(diff % 60);
      if (mins > 0) {
        return mins + ' minutes ' + secs + ' seconds';
      } else {
        return secs + ' seconds';
      };
    };
  })

  .filter('hms', function() {
    return function(delta) {
      function pad(n) {
        return (n < 10) ? ("0" + n) : n;
      }
      var days = Math.floor(delta / 86400);
      delta -= days * 86400;
      var hours = Math.floor(delta / 3600) % 24;
      delta -= hours * 3600;
      var minutes = Math.floor(delta / 60) % 60;
      delta -= minutes * 60;
      var seconds = Math.floor(delta % 60);
      if (days > 0) {
        return days + ' days ' + hours + ':' + pad(minutes) + ':' + pad(seconds);
      } else {
        return hours + ':' + pad(minutes) + ':' + pad(seconds);
      }
    };
  })

  .filter('diff', function() {
    return function(receive, create) {
      return new Date(receive).getTime() - new Date(create).getTime();
    };
  })

  .filter('isExpired', function() {
    return function(expire) {
      return new Date().getTime() > new Date(expire).getTime();
    };
  })

  .filter('shortid', function() {
    return function(id) {
      return String(id).substring(0, 8);
    };
  })

  // https://github.com/wildlyinaccurate/angular-relative-date
  .filter('relativeDate', function() {
    return function(date) {
      var now = new Date();
      var calculateDelta, day, delta, hour, minute, month, week, year;
      if (!(date instanceof Date)) {
        date = new Date(date);
      }
      delta = null;
      minute = 60;
      hour = minute * 60;
      day = hour * 24;
      week = day * 7;
      month = day * 30;
      year = day * 365;
      calculateDelta = function() {
        return delta = Math.round((now - date) / 1000);
      };
      calculateDelta();
      if (delta > day && delta < week) {
        date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
        calculateDelta();
      }
      switch (false) {
        case !(delta < 30):
          return 'just now';
        case !(delta < minute):
          return "" + delta + " seconds ago";
        case !(delta < 2 * minute):
          return 'a minute ago';
        case !(delta < hour):
          return "" + (Math.floor(delta / minute)) + " minutes ago";
        case Math.floor(delta / hour) !== 1:
          return 'an hour ago';
        case !(delta < day):
          return "" + (Math.floor(delta / hour)) + " hours ago";
        case !(delta < day * 2):
          return 'yesterday';
        case !(delta < week):
          return "" + (Math.floor(delta / day)) + " days ago";
        case Math.floor(delta / week) !== 1:
          return 'a week ago';
        case !(delta < month):
          return "" + (Math.floor(delta / week)) + " weeks ago";
        case Math.floor(delta / month) !== 1:
          return 'a month ago';
        case !(delta < year):
          return "" + (Math.floor(delta / month)) + " months ago";
        case Math.floor(delta / year) !== 1:
          return 'a year ago';
        default:
          return 'over a year ago';
      }
    };
  });
