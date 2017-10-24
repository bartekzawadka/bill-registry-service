'use strict';

//var mongoose = require('mongoose');
var gridfs = require('mongoose-gridfs')({
   collection: 'bills',
   model: 'Bill'
});

var Bill = gridfs.model;
var BillSchema = gridfs.schema;

BillSchema.add({
    originalname: String,
    mimeType: String
});

module.exports = Bill;