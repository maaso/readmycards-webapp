'use strict';
const config = require(__base + 'modules/t1t-config');
const request = require('request');
const _ = require('lodash');
const cloudconvert = new (require('cloudconvert'))(config.cloudconvert.apikey);
var fs = require('fs');


module.exports = {
    generateSummary: generateSummary
};


function generateSummary(req, res) {

    console.log(req.body);

    fs.createReadStream('client/views/demo/components/summary.html').pipe(cloudconvert.convert({
        inputformat: 'html',
        outputformat: 'pdf',
    })).pipe(fs.createWriteStream('outpdf.pdf')).on('finish', function () {
        console.log('Done!');
        return res.status(200).end();
    });


    // fs.createReadStream('in.png')
    //     .pipe(cloudconvert.convert({
    //         inputformat: 'png',
    //         outputformat: 'jpg',
    //         converteroptions: {
    //             quality : 75,
    //         }
    //     }))
    //     .pipe(fs.createWriteStream('out.jpg'))
    //     .on('finish', function() {
    //         console.log('Done!');
    //         return res.status(200);
    //     });
}