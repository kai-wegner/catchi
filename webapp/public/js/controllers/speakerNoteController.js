catchi.controller('speakerNoteController', ['$scope','$http','$sce',function ($scope,$http,$sce) {

  $scope.loadSpeakerNotes = function(id) {

    $http.get('/controls/'+id+'/plain').success(function(result) {
      $scope.metaData = result;

      var newFrame = window.location.hash.substr(1);
      $scope.speakerNote = $sce.trustAsHtml(searchSpeakerNote(newFrame)+"<div id='frameName'><hr>Frame: "+newFrame+"</div>");
    });
  };

  window.addEventListener("hashchange",function(e) {
    var newFrame = e.newURL.substr(e.newURL.lastIndexOf('#')+1);
    $scope.speakerNote = $sce.trustAsHtml(searchSpeakerNote(newFrame)+"<hr><div id='frameName'>Frame: "+newFrame+"</div>");
    $scope.$apply();
  });

  function searchSpeakerNote(currentFrame) {
    var frames = $scope.metaData.frames;

    for(var frameIndex in frames) {
      var frame = frames[frameIndex];
      if(frame.catchi !== undefined &&
         frame.frameId == currentFrame) {
        return frame.catchi.description;
      }
    }
    return "no notes for frame &quot;"+currentFrame+"&quot;";
  }
}]);
