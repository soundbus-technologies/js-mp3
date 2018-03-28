var assert = require('assert');
var Bits = require('../src/bits');
var chai = require('chai');
var should = chai.should();

describe('bits', function() {
    describe('#createNew()', function() {
        it('should return new bits object.', function() {
            var bits = Bits.createNew();
            should.exist(bits, 'bits should exist.');
            bits.should.be.an('object');
            bits.should.have.property('vec');
            bits.should.have.property('bitPos', 0);
            bits.should.have.property('bytePos', 0);
        });
    });

    describe('#Bits()', function() {
        var data = new Uint8Array([85, 170, 204, 51]);
        var bits = Bits.createNew(data.buffer);

        it('should not equals to specified value.', function(done) {
            if (bits.Bits(1) !== 0) {
                done(new Error("bits.Bits(1) should equals to 0 on this step."));
                return;
            }
            if (bits.Bits(1) !== 1) {
                done(new Error("bits.Bits(1) should equals to 1 on this step."));
                return;
            }
            if (bits.Bits(1) !== 0) {
                done(new Error("bits.Bits(1) should equals to 0 on this step."));
                return;
            }
            if (bits.Bits(1) !== 1) {
                done(new Error("bits.Bits(1) should equals to 1 on this step."));
                return;
            }
            if (bits.Bits(8) !== 90) {
                done(new Error("bits.Bits(8) should equals to 90 on this step."));
                return;
            }
            if (bits.Bits(12) !== 2764) {
                done(new Error("bits.Bits(12) should equals to 2764 on this step."));
                return;
            }
            done();
        });
    });
});