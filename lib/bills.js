var express = require('express');
var router = express.Router();
var path = require('path');
var Bill = require(path.join(__dirname, '..', 'models', 'bill.js'));
var apiUtils = require(path.join(__dirname, 'apiUtils'));
var mime = require('mime-types');

function dataURLtoFile(dataurl) {
    var arr = dataurl.split(',');
    var mime = arr[0].match(/:(.*?);/)[1];

    return Buffer.from(arr[1], 'base64');
}

router.get('/bill/:id', function(req, res, next){
    if(!req.params || !req.params.id){
        apiUtils.sendError(res, 400, "Bill ID was not specified");
        return;
    }

    Bill.findById(req.params.id).exec(function(error, data){
        if(error){
            apiUtils.sendError(res, 400, error);
            return;
        }

        if(!data) {
            apiUtils.sendError(res, 400, "No data found for specified item");
            return;
        }

        try {

            var file = dataURLtoFile(data.billData);
            var extension = mime.extension(data.mimeType);

            var fileName = req.params.id;
            if(extension){
                fileName += '.' + extension;
            }

            res.setHeader('Content-Disposition', 'attachment;filename=' + fileName);
            res.setHeader('Content-Type', data.mimeType);
            res.setHeader('Content-Length', file.length);
            res.end(file);
        } catch (e){
            apiUtils.sendError(res, 400, e);
        }
    });
});

module.exports = router;