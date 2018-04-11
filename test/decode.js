var Mp3 = require('../src/decode');
var data = require('./data');
var chai = require('chai');
var should = chai.should();

describe('mp3', function() {
    describe('#newSource()', function() {
        it('should return new source object.', function() {
            var source = Mp3.newSource(data.buffer());
            should.exist(source, 'source should exist.');
            source.should.be.an('object');
        });
    });

    describe('source', function() {
        describe('#seek', function() {
            it('should find position.', function() {
                var source = Mp3.newSource(data.buffer());
                var r = source.seek(1, 0);
                r.pos.should.equal(1);
            });
        });
        describe('#skipTags', function() {
            it('print tags.', function() {
                var source = Mp3.newSource(data.buffer());
                source.skipTags();
                source.pos.should.equal(0);
            });
        });
    });

    describe('#newDecoder()', function() {
        it('should return new decoder object.', function() {
            var buf = data.buffer();
            console.log('data byteLength: ' + buf.byteLength);

            var decoder = Mp3.newDecoder(buf);
            should.exist(decoder, 'decoder should exist.');
            decoder.should.be.an('object');

            var pcm_buffer = decoder.decode();
            console.log('pcm_buffer byteLength: ' + pcm_buffer.byteLength);
        });
    });
});