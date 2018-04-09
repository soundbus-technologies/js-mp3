var Frameheader = require('../src/frameheader');
var consts = require('../src/consts');
var Mp3 = require('../src/decode');
var chai = require('chai');
var should = chai.should();
var data = require('./data');

describe('frameheader', function() {
    describe('#createNew()', function() {
        it('should return new bits object.', function() {
            var fh = Frameheader.createNew();
            should.exist(fh, 'frameheader should exist.');
            fh.should.be.an('object');
        });
    });

    describe('#bitrate()', function() {
        describe('Layer1 data.', function() {
            var layer_arr = [0, 32000, 64000, 96000, 128000, 160000, 192000, 224000,
                              256000, 288000, 320000, 352000, 384000, 416000, 448000];
            it('should correct.', function() {
                for (var i = 0; i < layer_arr.length; i++) {
                    Frameheader.bitrate(consts.Layer1, i).should.equal(layer_arr[i]);
                }
            });
        });

        describe('Layer2 data.', function() {
            var layer_arr = [0, 32000, 48000, 56000, 64000, 80000, 96000, 112000,
                              128000, 160000, 192000, 224000, 256000, 320000, 384000];
            it('should correct.', function() {
                for (var i = 0; i < layer_arr.length; i++) {
                    Frameheader.bitrate(consts.Layer2, i).should.equal(layer_arr[i]);
                }
            });
        });

        describe('Layer3 data.', function() {
            var layer_arr = [0, 32000, 40000, 48000, 56000, 64000, 80000, 96000,
                             112000, 128000, 160000, 192000, 224000, 256000, 320000];
            it('should correct.', function() {
                for (var i = 0; i < layer_arr.length; i++) {
                    Frameheader.bitrate(consts.Layer3, i).should.equal(layer_arr[i]);
                }
            });
        });
    });

    describe('#read()', function () {
        it('should create new instance from provided data.', function() {
            var source = Mp3.newSource(data.buffer());
            source.skipTags();
            var result = Frameheader.read(source, 0);
            should.exist(result);
            result.h.should.be.an('object');
            should.equal(result.h.value, 4294697668, 'frameheader should equal 4294697668');
        });
    });
});