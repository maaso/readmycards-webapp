'use strict';
const request = require('request');
const config = require(__base + 'modules/t1t-config');
const cloudconvert = new (require('cloudconvert'))(config.cloudconvert.apikey);
const q = require('q');
const miss = require('mississippi2');



function jp2000ToJpeg(base64JP2000) {
    let pic = q.defer();
    let jp2000Buffer = Buffer.from(base64JP2000, 'base64');

    miss.fromValue(jp2000Buffer)
        .pipe(cloudconvert.convert({
            inputformat: 'jpg',
            outputformat: 'jpg',
        }))
        .on('error', err => {
            return pic.reject(err);
        })
        .on('finished', conversion => {
            miss.toPromise(request.get('http:' + conversion.output.url)).then(buffer => {
                pic.resolve(buffer.toString('base64'));
            }, err => {
                pic.reject(err);
            });

        });

    return pic.promise;
}


module.exports = {
    jp2000ToJpeg: jp2000ToJpeg
};