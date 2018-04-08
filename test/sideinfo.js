var Sideinfo = require('../src/sideinfo');
var chai = require('chai');
var should = chai.should();

describe('Sideinfo', function() {
    describe('#createNew()', function() {
        it('should return new and correct instance.', function() {
            var si = Sideinfo.createNew();
            should.exist(si);
            si.should.be.an('object');

            si.should.hasOwnProperty('Scfsi');
            si.Scfsi.should.be.an('array');
            si.Scfsi[0].should.be.an('array');

            si.should.hasOwnProperty('Preflag');
            si.Preflag.should.be.an('array');
            si.Preflag[0].should.be.an('array');
        });
    });
});