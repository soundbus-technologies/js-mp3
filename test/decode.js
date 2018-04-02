var assert = require('assert');
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
                var pos = source.seek(1, 0);
                pos.should.equal(1);
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
});