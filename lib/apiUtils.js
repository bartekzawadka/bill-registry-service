'use strict';
var fs = require('fs');
var path = require('path');
var uuidv4 = require('uuid/v4');

module.exports = {
    sendError: function (res, errorCode, error) {
        if (!errorCode) {
            errorCode = 400;
        }

        var msg = error;

        if (error && error.message) {
            msg = error.message;
        }

        res.writeHead(errorCode, msg, {'content-type': 'text/plain'});
        res.end(msg);
    },

    saveFileToUploads: function (base64Data, filePath) {
        return new Promise(function (resolve, reject) {
            var fileName = uuidv4();
            var fileLocation = path.join(filePath, fileName);

            var splits = base64Data.split(',');
            if (splits.length < 2) {
                throw new Error('Invalid Base64 data format');
            }

            var data = splits[1];
            fs.writeFile(fileLocation, data, 'base64', function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        fullPath: fileLocation,
                        fileName: fileName
                    });
                }
            });
        });
    }
};