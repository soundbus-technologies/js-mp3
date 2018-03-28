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
        describe('#skipTags', function() {
            it('print tags.', function() {
                var source = Mp3.newSource(data.buffer());
            });
        });
    });
});