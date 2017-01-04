'use strict';
const config = require(__base + 'modules/t1t-config');

function index(req, res) {
    if (config.environment.toLowerCase() === 'local') return res.render("./index-dev.ejs");
    else return res.render("index");
}

module.exports = {
    index: index
};