var maindata = require('../src/maindata');
var chai = require('chai');
var should = chai.should();

describe('maindata', function () {
    describe('#createNew()', function () {
        var md = maindata.createNew();
        console.log('md.Is: ' + md.Is);
    });
});