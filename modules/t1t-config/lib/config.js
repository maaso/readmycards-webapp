// Base directory fallback
var __base = global.__base || __base;
if (__base === undefined){
  __base = process.cwd() + '/';
}

var basedir = __base;
var yamlConfig = require('node-yaml-config');
var fs = require('fs');

// Config
var configFile = basedir + 'config/config.yml';
if (!fs.existsSync(configFile)) {
  console.log(configFile + ' not found, exiting.');
  process.exit(0);
}
var config = yamlConfig.load(basedir + 'config/config.yml');

// Database config
var dbConfigFile = basedir + 'config/database.json';
if (fs.existsSync(dbConfigFile)) {
  config.db = require(dbConfigFile);
}

// App config
var appConfigFile = basedir + 'config/app.json';
if (fs.existsSync(appConfigFile)) {
  config.app = require(appConfigFile);
}

exports = module.exports = config;
