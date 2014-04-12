'use strict';

/* Directives */


var alertaDirectives = angular.module('alertaDirectives', []);

alertaDirectives.directive('buttonsRadio', function() {
    return {
        restrict: 'E',
        scope: { model: '=', options:'='},
        controller: function($scope){
            $scope.activate = function(option){
                $scope.model = option;
            };
        },
        template: "<button type='button' class='btn btn-default' "+
                    "ng-class='{active: option == model}'"+
                    "ng-repeat='option in options' "+
                    "ng-click='activate(option)'>{{option | capitalize }} "+
                    " <span class='badge'>0</span>"+
                  "</button>"
    };
  });
