# js-mp3
Pure javascript mp3 decoder, WIP.  
[![Build Status](https://travis-ci.org/soundbus-technologies/js-mp3.svg?branch=master)](https://travis-ci.org/soundbus-technologies/js-mp3)

### Usage
```javascript
let Mp3 = require('js-mp3');

var mp3ArrayBuffer = ...; // prepare your mp3 decoded array buffer here

var decoder = Mp3.newDecoder(mp3ArrayBuffer);
var pcmArrayBuffer = decoder.decode(); // now you got decoded PCM data

```
you can visit [js-mp3-example](https://gitlab.oifitech.com/web-frontend/js-mp3-example) project to see how to decode mp3 file then play it. 

### Tests
#### Frameworks
- `rewire`: https://github.com/jhnns/rewire
- `Mocha`: https://mochajs.org/
- `Chai`: https://github.com/chaijs/chai
- `Istanbul`: https://github.com/gotwarlost/istanbul

Run tests with:
```bash
$ npm test
```
Get coverage report:
```bash
$ npm run coverage 
```
Then you can find the report html here: `{project_location}/coverage/lcov-report/index.html`.
