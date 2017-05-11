(function(angular) {
  var ItemFactory = function() {
    return {id: 0, description: "aaaa"}
  };

  //ItemFactory.$inject = ['$resource'];
  angular.module("myApp.services").factory("Item", ItemFactory);
}(angular));