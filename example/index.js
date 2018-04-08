var fs = require('fs');
var Mp3 = require('../index');

var ab = fs.readFileSync('/Users/jacky/Desktop/test.mp3', null).buffer;

var d = Mp3.newDecoder(ab);
