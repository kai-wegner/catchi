var express = require('express');
var fs		  = require("fs");
var path    = require('path');

var router  = express.Router();

var directory_data = path.join(__dirname,path.join('..', 'data'));
var presentations = {};


router
  .get('/', function(req, res, next) {
    presentations = loadDir();

    res.send(presentations.array);
  })
  .get('/:id',function(req, res, next) {
    presentations = loadDir();

    var presentation = presentations.hash[req.params.id];
    var content = getPresentationContent(presentation);

    res.locals.presentationId = req.params.id;

    renderPresentation(res,content,function(html) {
      res.set('Content-Type', 'text/html');
      res.send(html);
    });
  })
  .get('/:id/plain',function(req, res, next) {
    presentations = loadDir();

    var presentation = presentations.hash[req.params.id];
    var content = getPresentationContent(presentation);

    renderPresentation(res,content,function(html) {
      presentation.html = html;
      res.set('Content-Type', 'application/json');
      res.send(presentation);
    });
  })
  .post('/:id/plain',function(req, res, next) {
    presentations = loadDir();

    var presentation = presentations.hash[req.params.id];

    var metaDataFileName = presentation.name.replace(/\.sozi\.html/,'.catchi.json');

    res.send(saveMetaData(metaDataFileName,req.body.presentationMetaData));
  })
  .delete('/:id',function(req, res, next) {
    presentations = loadDir();

    var presentation = presentations.hash[req.params.id];

    try {
      fs.unlinkSync(path.join(directory_data,presentation.name));

      var metaDataFileName = presentation.name.replace(/\.sozi\.html/,'.catchi.json');
      try {
        fs.unlinkSync(path.join(directory_data,metaDataFileName));
      }
      catch (couldNotDeleteMetadata) {
        console.log("WARNING: Could not delete metadata-file: "+metaDataFileName+" because of: "+couldNotDeleteMetadata);
      }

      res.send({'deleted':presentation.name});
    }
    catch (exception) {
      res.send({'error':exception});
    }
  });



function loadDir() {
  var items = [];
  var hash = {};
  fs.readdirSync(directory_data).forEach(function(fileName) {
    var i = 0;
    if(fileName.lastIndexOf('sozi.html') == fileName.length-9) {
        var metadata = readMetaData(fileName);

        var id = fileName.substring(0,fileName.length-10)+"_"+i;
        var obj = {
          'id':id,
          'name':fileName,
          'metaData':metadata
        };
        items.push(obj);
        hash[obj.id] = obj;
        i++;
    }

  });
  return {"array":items,"hash":hash};
}

function renderPresentation(res,presentationContent,callback) {
  res.render('presentation', { 'presentationContent': '@@presentationContent@@'},
    function(err,html) {
      if(err === null) {
        html = html.replace(/@@presentationContent@@/,presentationContent);
        callback(html);
      }
      else res.send(err);
    }
  );
}

function getPresentationContent(presentation) {
  var presentationContent =
    fs.readFileSync(path.join(directory_data, presentation.name),'utf8');

  var svgTag = presentationContent.indexOf('<svg')-1;
  var lastScriptTag = presentationContent.lastIndexOf('</script>')+9;

  presentationContent = presentationContent.substring(svgTag,lastScriptTag);
  return presentationContent;
}

function readMetaData(fileName) {
  var metaDataFileName = fileName.replace(/\.sozi\.html/,'.catchi.json');
  var metaDataFile = path.join(directory_data, metaDataFileName);

  var metaData = {};
  try {
    if(fs.existsSync(metaDataFile))
      metaData = JSON.parse(fs.readFileSync(metaDataFile,'utf8'));
    else extractMetaData(fileName,metaDataFile);
  }
  catch (couldNotGetMetadata) {
    console.log("WARNING: Could not get metadata of "+metaDataFile+" because of: "+couldNotGetMetadata);
  }

  return metaData;
}

function extractMetaData(fileName,targetFile) {
  var presentationContent =
    fs.readFileSync(path.join(directory_data, fileName),'utf8');

  var dataVariable = presentationContent.indexOf('var soziPresentationData = ')+27;
  presentationContent = presentationContent.substring(dataVariable);

  var scriptTag = presentationContent.indexOf('</script>')-1;
  presentationContent = presentationContent.substring(0,scriptTag);

  var originalJSON = JSON.parse(presentationContent);
  var newJSON = {frames:[]};

  for(var frameIndex in originalJSON.frames)
    newJSON.frames.push({
      frameId:originalJSON.frames[frameIndex].frameId,
      title:originalJSON.frames[frameIndex].title,
    });

  fs.writeFileSync(targetFile,JSON.stringify(newJSON));
}

function saveMetaData(fileName,metaData) {
  fs.writeFileSync(path.join(directory_data, fileName), JSON.stringify(metaData));

  return {"saved":metaData,"status":"ok"};
}

module.exports = router;
