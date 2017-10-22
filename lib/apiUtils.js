'use strict';
var fs = require('fs');

module.exports = {
  sendError: function(res, errorCode, error){
      if(!errorCode){
          errorCode = 400;
      }

      var msg = error;

      if(error && error.message){
          msg = error.message;
      }

      res.writeHead(errorCode, msg, {'content-type': 'text/plain'});
      res.end(msg);
  },
  convertFileToBase64: function(file, type) {
      return 'data:'+type+';base64,' + new Buffer(file.buffer).toString('base64');
  }
};