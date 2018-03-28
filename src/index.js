var lang = require('./lang');
var sizeof = require('object-sizeof');

console.log(sizeof(Number.MAX_SAFE_INTEGER));

console.log(Number.MAX_SAFE_INTEGER);
var v = lang.toUint(Number.MAX_SAFE_INTEGER);
console.log(v);