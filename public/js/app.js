'use strict'

var app = angular.module('plunker', ['ui.sortable', 'ngScrollable']);

app.controller('MainCtrl', function ($scope) {
  var moving = false;
  $scope.photos = populateList();

  function populateList() {
    var array = [];
    for (var i = 1; i <= 10; i++) {
      array.push({url: "/images/" + i + ".jpg"});
    }

    return array;
  }

  window.globalScope = $scope;

  $scope.isMoving = function () { console.log('moving = ' + moving); return moving; }

  $scope.scrollUp = function () {
    $scope.$broadcast('scrollable.scroll.top');
  }

  $scope.scrollDown = function () {
    $scope.$broadcast('scrollable.scroll.bottom');
  }

  $scope.sortableOptions = {
    containment: '#sortable-container',
    additionalPlaceholderClass: 'col-lg-12',
    accept: function(sourceItemHandleScope, destSortableScope) {
      showScrollHelpers();
      return true;
    },
    orderChanged: function(event) {
      window.clearTimeout(hideScrollHelpersTimeout);
      hideScrollHelpers();
    }
  };

  var hideScrollHelpersTimeout = window.setTimeout(hideScrollHelpers, 0);
  var hideScrollHelpers = function () {
    moving = false;
  };

  function showScrollHelpers() {
    moving = true;
    console.log($scope.isMoving());

    hideScrollHelpersTimeout = window.setTimeout(hideScrollHelpers, 1500);
  };
}).directive('ngTouchstart', [function() {
    return function(scope, element, attr) {

        element.on('touchstart', function(event) {
            scope.$apply(function() { 
                scope.$eval(attr.ngTouchstart); 
            });
        });
    };
}]).directive('ngTouchend', [function() {
    return function(scope, element, attr) {

        element.on('touchend', function(event) {
            scope.$apply(function() { 
                scope.$eval(attr.ngTouchend); 
            });
        });
    };
}]);