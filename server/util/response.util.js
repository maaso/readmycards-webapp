'use strict';

function error(error, res) {
    return res.status(error.status).json(error);
}

module.exports = {
    error: error
};