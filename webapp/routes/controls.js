var express = require('express');
var fs		  = require("fs");
var path    = require('path');

var router  = express.Router();

var directory_data = path.join(__dirname,path.join('..', 'data'));

router
  .get('/:id',function(req, res, next) {
    var metaData = getPresentationMetaData(req.params.id);

    res.render("controls",{'presentationId':req.params.id});
  })
  .get('/:id/plain',function(req, res, next) {
    var metaData = getPresentationMetaData(req.params.id);

    res.set('Content-Type', 'application/json');
    res.send(metaData);
  });

function getPresentationMetaData(id) {
  var metadata = readMetaData(id.substring(0,id.lastIndexOf("_"))+'.catchi.json');

  return metadata;
}

function readMetaData(metaDataFileName) {
  var metaDataFile = path.join(directory_data, metaDataFileName);

  var metaData = {};
  if(fs.existsSync(metaDataFile))
    metaData = JSON.parse(fs.readFileSync(metaDataFile,'utf8'));

  return metaData;
}
module.exports = router;
