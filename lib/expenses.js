var express = require('express');
var router = express.Router();
var path = require('path');
var _ = require('lodash');
var multer = require('multer');
var Expense = require(path.join(__dirname, '..', 'models', 'expense.js'));
var Bill = require(path.join(__dirname, '..', 'models', 'bill.js'));
var apiUtils = require(path.join(__dirname, 'apiUtils'));

var storage = multer.memoryStorage({});
var uploader = multer({storage: storage});

router.get('/expense/:id', function (req, res, next) {
    if (!req.params || !req.params.id) {
        apiUtils.sendError(res, 400, "Expense ID was not specified");
        return;
    }

    Expense.findById(req.params.id).populate('bill').select('name description created amount bill').exec(function (error, data) {
        if (error) {
            apiUtils.sendError(res, 400, error);
            return;
        }

        res.send(data);
    });
});

router.get('/expenses', function (req, res) {

    var skip = 0;
    var limit = 50;
    var searchString = undefined;
    var supportedSortingFileds = ['name', 'created', 'amount'];

    if (req.query) {
        try {
            if (req.query.limit && parseInt(req.query.limit) > 0 && parseInt(req.query.limit) <= 50) {
                limit = parseInt(req.query.limit);
            }
        } catch (e) {
            apiUtils.sendError(res, 400, "Unknown format of input parameter 'limit'");
            return;
        }
        try {
            if (req.query.skip && parseInt(req.query.skip) > 0) {
                skip = parseInt(req.query.skip*limit);
            }
        } catch (e) {
            apiUtils.sendError(res, 400, "Unknown format of input parameter 'skip'");
            return;
        }
    }

    if (searchString) {
        searchString = searchString.replace('.', '').replace(',', '');
    }

    var findObject = {};
    if (req.query && req.query.searchString) {

        searchString = req.query.searchString;

        findObject = {
            "$or": [
                {
                    name: {
                        "$regex": '.*' + searchString + '.*', "$options": 'i'
                    }
                },
                {
                    description: {
                        "$regex": '.*' + searchString + '.*', "$options": 'i'
                    }
                },
                {
                    amountText: {
                        "$regex": '.*' + searchString + '.*', "$options": 'i'
                    }
                }
            ]
        };
    }

    var sort = [['created', 'descending']];

    if(req.query.sortField){
        if(!_.includes(supportedSortingFileds, req.query.sortField)){
            apiUtils.sendError(res, 400, 'Sorting by field \''+req.query.sortField+'\' is not supported');
            return;
        }

        var direction = 'descending';
        if(req.query.orderBy && req.query.orderBy === 'ascending'){
            direction = 'ascending';
        }

        sort = [[req.query.sortField, direction]];
    }

    Expense.find(findObject).count(function (countError, count) {

        if (countError) {
            apiUtils.sendError(res, 400, countError);
            return;
        }

        Expense.find(findObject)
            .limit(limit)
            .skip(skip)
            .populate('bill', 'mimeType')
            .select('name description created amount bill')
            .sort(sort)
            .exec(function (error, data) {
            if (error) {
                apiUtils.sendError(res, 400, error);
                return;
            }

            res.send({
                count: count,
                rows: data
            });
        });
    });
});

router.post('/expense', uploader.single('file'), function (req, res) {
    if (!req.body) {
        apiUtils.sendError(res, 400, "No expense data received");
        return;
    }

    if (!req.body.name) {
        apiUtils.sendError(res, 400, "Expense name is required");
        return;
    }

    if (!req.body.amount) {
        apiUtils.sendError(res, 400, "Expense amount is required");
        return;
    }

    var amount = req.body.amount;

    try {
        amount = parseFloat(amount.toString()).toFixed(2);
    } catch (ex) {
        apiUtils.sendError(res, 400, "Invalid amount format (2 decimal spaces required)");
        return;
    }

    var billData = undefined;

    if (!req.body.billData && (!req.file || !req.file.buffer)) {
        apiUtils.sendError(res, 400, "Expense bill image is required");
        return;
    } else if(!req.body.billMimeType) {
        apiUtils.sendError(res, 400, "Expense bill image mime-type is required");
        return;
    }

    try {
        billData = (req.body.billData ?
            req.body.billData :
            apiUtils.convertFileToBase64(req.file, req.body.billMimeType));
    }catch (e){
        apiUtils.sendError(res, 500, e);
        return;
    }

    if (req.body.billId) {
        Bill.findOne({_id: req.body.billId}, function (e, updatedBill) {
            if (e) {
                apiUtils.sendError(res, 400, e);
                return;
            }

            updatedBill.billData = billData;
            updatedBill.mimeType = req.body.billMimeType;
            updatedBill.save();

            Expense.findOne({_id: req.body.id}, function (error, expense) {
                if (error) {
                    apiUtils.sendError(res, 400, error);
                    return;
                }

                expense.name = req.body.name;
                expense.description = req.body.description;
                expense.amount = req.body.amount;

                expense.save();

                res.send({id: expense._id});
            });
        });
    } else {
        Bill.create({
            billData: billData,
            mimeType: req.body.billMimeType
        }, function (e, newBill) {
            if (e) {
                apiUtils.sendError(res, 400, e);
                return;
            }

            var expense = {
                name: req.body.name,
                description: req.body.description,
                amount: amount,
                bill: newBill._id
            };

            Expense.create(expense, function (error, expense) {
                if (error) {
                    apiUtils.sendError(res, 400, error);
                    return;
                }

                res.send({id: expense._id});
            });
        });
    }
});


module.exports = router;