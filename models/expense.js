'use strict';

var mongoose = require('mongoose');

var expenseSchema = mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: false},
    created: {type: Date, required: true},
    amount: {type: Number, required: true},
    amountText: {type: String},
    bill: {type: mongoose.Schema.Types.ObjectId, ref: 'Bill', required: true}
}, {
    collection: "expenses"
});

expenseSchema.pre('validate', function(next){
    if(this.isNew){
        this.created = new Date();
    }

    next();
});

expenseSchema.pre('save', function(next){
   this.amountText = this.amount.toString();

   next();
});

expenseSchema.set('toObject', { getters: true, setters: true });
expenseSchema.set('toJSON', { getters: true, setters: true });

expenseSchema.path('amount').get(function(num){
   return (num/100).toFixed(2);
});

expenseSchema.path('amount').set(function(num){
    return num * 100;
});

var User = mongoose.model('Expense', expenseSchema);
module.exports = User;