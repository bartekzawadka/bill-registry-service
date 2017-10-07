var express = require('express');
var router = express.Router();
var path = require('path');
var Bill = require(path.join(__dirname, '..', 'models', 'bill.js'));
var apiUtils = require(path.join(__dirname, 'apiUtils'));


router.get('/bill/:id', function(req, res, next){
    if(!req.params || !req.params.id){
        apiUtils.sendError(res, 400, "Bill ID was not specified");
        return;
    }

    Bill.findById(req.params.id).exec(function(error, data){
        if(error){
            apiUtils.sendError(res, 500, error);
            return;
        }

        res.send(data);
    });
});

module.exports = router;