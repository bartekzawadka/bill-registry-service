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

      // res.statusCode = errorCode;
      // res.statusMessage = message;
      // res.body = {"error": message};
      // res.response = message;
      // res.message = message;
      // res.end();
  },
  convertFileToBase64: function(file, type) {
      return 'data:'+type+';base64,' + new Buffer(file.buffer).toString('base64');
  },
  clearRequestBody: function(data) {
      // return data.filter(function(item){
      //    return item !== 'undefined';
      // });
      for(var k in data){
          //if(data.hasOwnProperty(k)){
              if(data[k] === 'undefined'){
                  data[k] = undefined;
              }
          //}
      }

      return data;
  }
};