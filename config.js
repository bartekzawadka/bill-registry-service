'use strict';

module.exports = {
    db: {
        uri: 'mongodb://'+process.env['DB_SERVER_NAME']+':'+process.env['MASTER_KEY']+'@'+process.env['DB_SERVER_NAME']+
            '.documents.azure.com:10255/'+process.env['DB_NAME']+'?ssl=true&sslverifycertificate=false',
        options: {
            user: '',
            pass: ''
        }
    }
};