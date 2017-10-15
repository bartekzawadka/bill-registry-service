'use strict';

var mongoose = require('mongoose');

var billSchema = mongoose.Schema({
    thumbnail: {type: String, required: false},
    billData: {type: String, required: true},
    mimeType: {type: String, required: false}
}, {
    collection: "bills"
});

var Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;