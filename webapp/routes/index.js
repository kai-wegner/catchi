var express = require('express');
var fs		  = require("fs");
var path    = require('path');

var router  = express.Router();


/* GET home page. */
router
  .get('/', function(req, res, next) {
    res.render('index', { 'title': 'catchi','presentationId' : '','upload':''});
  })
  .post('/',function(req,res,next) {

    if(req.files.sozifile != null) {
      var sozifile = req.files.sozifile;

      var uploadPath = sozifile.path;
      var targetPath = "data/"+sozifile.originalname;

      var renderObj = {
        'title': 'catchi',
        'presentationId' : '',
        'upload':true,
        'uploadedFile':'',
        'uploadFileError':''
      };

      if(sozifile.originalname.indexOf('sozi.html') != -1) {
        if(isValidSoziFile(uploadPath)) {
          renderObj.uploadedFile = sozifile.originalname;

          try {
            var fd = fs.openSync(targetPath,'r+');
            fs.closeSync(fd);
            renderObj.uploadFileError =
              'File '+sozifile.originalname+' already exists!';
          }
          catch (exception) {
            fs.renameSync(uploadPath, targetPath);
          }
        }
        else renderObj.uploadFileError = 'Not a valid sozi-presentation!';
      }
      else renderObj.uploadFileError =
        'Only files with a .sozi.html extension are accepted. '+
        'Eg. presentation.sozi.html';

      res.render('index',renderObj);
    }
  });

function isValidSoziFile(path) {
  var fileContent = fs.readFileSync(path,'utf8');

  if(fileContent.indexOf('<svg') != -1 &&
     fileContent.indexOf('http://sozi.baierouge.fr') != -1 &&
     fileContent.indexOf('var soziPresentationData = ') != -1)
    return true;
  else return false;
}

module.exports = router;
