catchi.controller('presentationTimeController', ['$scope','$interval',function ($scope,$interval) {
  $scope.currentSecond = 0;
  $scope.currentMinute = 0;

  $interval(function() {
    $scope.currentSecond += 1;

    if($scope.currentSecond % 60 == 0) {
      $scope.currentMinute += 1;
      $scope.currentSecond = 0;
    }
    $scope.presentationTime = $scope.currentMinute+":"+$scope.currentSecond;
  },1000);

}]);
