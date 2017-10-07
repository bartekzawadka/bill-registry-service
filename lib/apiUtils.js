'use strict';

module.exports = {
  sendError: function(res, errorCode, message){
      res.writeHead(errorCode, {"Content-Type": "application/json"});
      res.end(JSON.stringify({error: message}));
  }
};