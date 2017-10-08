'use strict';

var path = require('path');
var mongoose = require('mongoose');
var config = require(path.join(__dirname, 'config.js'));

var port = process.env.PORT || 80;

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');

var expenses = require('./lib/expenses');

var app = express();

var server = http.createServer(app);

app.use(function crossOrigin(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", 'X-Requested-With');
    return next();
});

app.use(bodyParser.json());
app.use('/api', expenses);

mongoose.Promise = global.Promise;

mongoose.connect(config.db.uri, config.db.options, null, function(err){
    if(err){
        console.log(err);
    }
});

mongoose.connection.on('error', function(err){
    console.log('[ERROR] app.js Database Connection Error. Please make sure that DB engine is running.');
    console.log(err);
    process.exit(1);
});

mongoose.connection.on('open', function(){
    console.log('[INFO] app.js Connected to Database server.');
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
});

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}