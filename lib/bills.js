var express = require('express');
var router = express.Router();
var path = require('path');
var apiUtils = require(path.join(__dirname, 'apiUtils'));
var mime = require('mime-types');

router.get('/bill/:id', function(req, res, next){

    var Bill = require(path.join(__dirname, '..', 'models', 'bill.js'));

    if(!req.params || !req.params.id){
        apiUtils.sendError(res, 400, "Bill ID was not specified");
        return;
    }

    Bill.findById(req.params.id).exec(function(error, bill){
        if (error) {
            apiUtils.sendError(res, 400, error);
            return;
        }

        var buffer = undefined;

        var stream = Bill.readById(req.params.id);
        stream.on('error', function(error){
            if (error) {
                apiUtils.sendError(res, 400, error);
            }
        });
        stream.on('data', function(data){
            if (!buffer) {
                buffer = data;
            } else {
                buffer = Buffer.concat([buffer, data]);
            }
        });
        stream.on('close', function(){

            var extension = mime.extension(bill.metadata.mimeType);

            var fileName = bill.metadata.originalname;
            if(fileName.includes('.')) {
                fileName = fileName.substring(0, fileName.lastIndexOf('.'));
            }
            fileName += '.' + extension;

            res.setHeader('Content-Disposition', 'attachment;filename=' + fileName);
            res.setHeader('Content-Type', bill.metadata.mimeType);
            res.setHeader('Content-Length', buffer.length);
            res.end(buffer);

        });
    });
});

module.exports = router;