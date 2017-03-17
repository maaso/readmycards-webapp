"use strict";
const jsonwebtoken = require("jsonwebtoken");
const moment = require("moment");

class JWT {
    constructor(token) {
        this.originalToken = token;
        this.parsedToken = jsonwebtoken.decode(token);
        this.expires = moment(this.parsedToken.exp * 1000);
    }

    get token() {
        return this.originalToken;
    }

    expired() {
        let now = moment();
        return (now > this.expires);
    };

    validFor(amount, type) {
        let now = moment();
        return (now < this.expires.subtract(amount, type));
    }
}

module.exports = JWT;
