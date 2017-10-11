'use strict';

module.exports = {
  sendError: function(res, errorCode, message){
      if(!errorCode){
          errorCode = 400;
      }

      res.statusCode = errorCode;
      res.statusMessage = message;
      res.end();
  }
};