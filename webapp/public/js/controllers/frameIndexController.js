catchi.controller('frameIndexController', ['$scope',function ($scope) {
  $scope.frameIndex = getIndexString();

  $scope.init = function() {
    opener.pWindow.sozi.player.addListener("frameChange", function() {
      $scope.frameIndex = getIndexString();
    });
  };

  function getIndexString() {
    var indexString =
      (opener.pWindow.sozi.player.currentFrameIndex+1)
      +" / "+
      opener.pWindow.soziPresentationData.frames.length;

    return indexString;
  }

}]);
