var Frame = require('../src/frame');
var Mp3 = require('../src/decode');
var chai = require('chai');
var should = chai.should();
var data = require('./data');

describe('frame', function() {
    describe('#createNew()', function() {
        it('should return new frame object.', function() {
            var f = Frame.createNew();
            should.exist(f, 'frame should exist.');
            f.should.be.an('object');
            f.store.length.should.equal(18);

            f.store[0].should.be.an('array');
            f.store[0].length.should.equal(32);

            f.store[0][0].length.should.equal(2);
            f.store[0][0].toString().should.equal('0,0');

            f.v_vec.should.be.an('array');
            f.v_vec[0].length.should.equal(2);
        });
    });

    describe('#read()', function () {
        it('should create frame instance by provided data.', function () {
            var source = Mp3.newSource(data.buffer());
            source.skipTags();
            var result = Frame.read(source, 0, null);
            should.exist(result);
            result.should.be.an('object');
            result.f.should.be.an('object');
        });
    });
});