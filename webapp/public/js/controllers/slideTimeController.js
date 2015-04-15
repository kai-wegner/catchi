catchi.controller('slideTimeController', ['$scope','$interval',function ($scope,$interval) {
  $scope.currentSecond = 0;
  $scope.currentMinute = 0;

  $interval(function() {
    $scope.currentSecond += 1;
    if($scope.currentSecond % 60 == 0) {
      $scope.currentMinute += 1;
      $scope.currentSecond = 0;
    }
    $scope.slideTime = $scope.currentMinute+":"+$scope.currentSecond;
  },1000);

  $scope.init = function() {
    opener.pWindow.sozi.player.addListener("frameChange", function() {
      $scope.currentSecond = 0;
      $scope.currentMinute = 0;
    });
  };
}]);
