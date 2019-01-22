'use strict';

var fs = require('fs');

function readExampleFile(name, raw) {
  var text = fs.readFileSync(name, 'UTF8');

  if (raw) {
    return text;
  } else {
    return JSON.parse(text);
  }
}

function delay(ms) {
  return function(callback) {
    setTimeout(callback, ms);
  };
}

exports.readExampleFile = readExampleFile;
exports.delay = delay;
