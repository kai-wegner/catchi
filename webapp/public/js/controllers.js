var catchi = angular.module('catchi', [
            'ui.bootstrap',
            'textAngular',
            'ngAnimate',
            'ngSanitize',
            'smart-table'
        ]);

catchi.factory('presentationService', ['$http', function($http) {
  var presentationService = {};

  var presentationHash = {};
  var presentationArray = [];

  var refreshCallback;

  presentationService.refresh = function() {
    console.log("PresentationService refresh()");

    $http.get('/presentations').success(function(result) {
      presentationArray = result;

      for(var presentationIndex in presentationArray) {
        var presentation = presentationArray[presentationIndex];

        presentationHash[presentation.id] = presentation;
      }

      if(refreshCallback !== undefined)
        refreshCallback(
          {'array':presentationArray,
           'hash':presentationHash}
        );

      console.log("PresentationService refreshed");
    });
  };

  presentationService.init = function() {
    console.log("PresentationService init()");

    this.refresh();

    return this;
  };
  presentationService.getById = function(id) {
    return presentationHash[id];
  };
  presentationService.getByIndex = function(index) {
    return presentationArray[index];
  };
  presentationService.onRefresh = function(callback) {
    refreshCallback = callback;
  };

  return presentationService;
}]);
