catchi.controller('bodyController',
  ['$scope','$http','$modal','$sce','presentationService',
    function ($scope,$http,$modal,$sce,presentationService) {

  $scope.alerts = [];

  presentationService.onRefresh(function(event) {
    $scope.presentations = [];
    $scope.presentationView = [].concat($scope.presentations);

    for(var presentationIndex in event.array)
      $scope.presentations.push(event.array[presentationIndex]);

    if($scope.presentationId !== '') {
      var presentation = presentationService.getById($scope.presentationId);

      if(presentation.metaData.catchi !== undefined &&
         presentation.metaData.catchi.properties !== undefined) {

        for(var key in presentation.metaData.catchi.properties) {
          var property = presentation.metaData.catchi.properties[key];
          $scope[property.key] = property.value;
        }
      }

      $scope.currentDate = moment();
    }


    console.log("BodyControler Presentation refreshed");
  });

  presentationService.init();

  $scope.loadPresentationMetaData = function(id) {
    $scope.presentationId = id;
  };

  $scope.startPresentation = function(id) {
    var presentator = window.open("/presentations/"+id,"catchi-presentation");

    if(presentator === undefined)
      triggerToast("Could not open presentation window - please check your popup-blocker.",'danger');

    pWindow = presentator.window;

    pWindow.addEventListener("load", function() {
      var speaker_control = window.open("/controls/"+id,"catchi-control");

      if(presentator === undefined)
        triggerToast("Could not open speaker window - please check your popup-blocker.",'danger');

      sWindow = speaker_control.window;

      sWindow.addEventListener("load",function() {
        var currentFrame = pWindow.sozi.player.currentFrame.frameId;
        sWindow.window.location.hash = currentFrame;

        sWindow.window.sozi = {};
        sWindow.window.sozi.player = pWindow.window.sozi.player;

        pWindow.sozi.player.addListener("frameChange", function() {
          currentFrame = pWindow.sozi.player.currentFrame.frameId;
          sWindow.window.location.hash = currentFrame;
        });
        if(sWindow.window.location.hash.length > 0) {
          var targetHash  = sWindow.window.location.hash.substr(1);
          var targetIndex = pWindow.sozi.presentation.getFrameWithId(targetHash).index;
          pWindow.sozi.player.jumpToFrame(targetIndex);
          pWindow.sozi.player.moveToFrame(targetIndex);
        }
      });
    });
  };

  $scope.deletePresentation = function(id) {
    var presentation = presentationService.getById(id);

    var deleteConfirmation =
      $scope.triggerConfirmDialog(
        'You\'re about to delete &quot;<b>'+presentation.name+'</b>&quot;.<br><b>Are you sure?</b>',
        function() {
          $http.delete('/presentations/'+id).success(function(result) {
            $scope.triggerToast('Deleted successfully!','success');

            presentationService.refresh();
          });
        }
      );

  };

  $scope.editPresentation = function(id) {
    $http.get('/controls/'+id+'/plain').success(function(result) {
      var presentation = presentationService.getById(id);

      if(result.catchi === undefined)
        result.catchi = {
          properties : []
        };
      else if (result.catchi.properties === undefined)
        result.catchi.properties = [];

      $scope.presentationMetaData = result;
      $scope.editPresentationId = id;
      $scope.presentation = presentation;

      document.getElementById('editContent').style.display = "block";
    });
  };
  $scope.saveEdit = function() {
    $http.post('/presentations/'+$scope.editPresentationId+'/plain',
      {presentationMetaData:$scope.presentationMetaData}).success(function(result) {

        $scope.triggerToast('Saved successfully!','success');
    });
  };
  $scope.closeEdit = function() {
    document.getElementById('editContent').style.display = "none";
  };

  $scope.uploadHandler = function(fileUpload,uploadError,uploadedFile) {

    if(fileUpload !== '') {
      if(uploadError === '')
        $scope.triggerToast(
          'Upload of "'+uploadedFile+'" successful',
          'success');
      else
        $scope.triggerToast(
          uploadError,
          'danger',
          'Upload failed!');
    }
  };

  $scope.triggerToast = function(message,type,mTitle) {
    var title = mTitle;
    if(title === undefined) title = 'Info';

    // success|info|warning|danger
    if(type == 'danger') title = 'Warning';

    $scope.alerts.push({
      'msg':message,
      'type':type
    });
  };

  $scope.triggerConfirmDialog = function(message,callback) {
    $scope.modalMessage = $sce.trustAsHtml(message);

    var boxOptions = {
      scope:$scope,
      templateUrl: 'confirmDialog.html'
    };

    var instance = $modal.open(boxOptions);
    instance.result.then(callback);
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };
}]);
