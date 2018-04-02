var consts = require('../src/consts');
var chai = require('chai');
var should = chai.should();

describe('consts', function() {
    describe('SamplingFrequencyInstance', function() {
        describe('#newSamplingFrequencyInstance', function () {
            it('should return new SamplingFrequencyInstance object.', function() {
                var s = consts.newSamplingFrequencyInstance(0);
                should.exist(s, 'SamplingFrequencyInstance should exist.');
                s.should.be.an('object');
                s.should.have.property('Int');
            });
        });

        describe('#Int', function () {
            var s = null;
            it('value 0 should return sampling frequency value 44100.', function() {
                s = consts.newSamplingFrequencyInstance(0);
                var value = s.Int();
                value.should.equal(44100);
            });

            it('value 1 should return sampling frequency value 48000.', function() {
                s = consts.newSamplingFrequencyInstance(1);
                var value = s.Int();
                value.should.equal(48000);
            });

            it('value 2 should return sampling frequency value 32000.', function() {
                s = consts.newSamplingFrequencyInstance(2);
                var value = s.Int();
                value.should.equal(32000);
            });

            it('other value should throw error.', function() {
                s = consts.newSamplingFrequencyInstance(3);
                should.Throw(s.Int, 'not reached');
            });
        });
    });

    describe('SfBandIndicesSet', function() {
        it('should has property/key in [0,1,2].', function() {
            should.exist(consts.SfBandIndicesSet[consts.SamplingFrequency44100]);
            should.exist(consts.SfBandIndicesSet[consts.SamplingFrequency48000]);
            should.exist(consts.SfBandIndicesSet[consts.SamplingFrequency32000]);
        });
    });
});