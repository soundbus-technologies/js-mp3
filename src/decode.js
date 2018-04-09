var Frame = require('./frame');
var util = require('./util');

const invalidLength = -1;

var Mp3 = {
    // Create new source object with specified ArrayBuffer
    newSource: function(buf) {
        var source = {
            buf: buf,
            pos: 0
        };

        /**
         * Seek the buffer position
         *
         * @param position
         * @param whence
         * @returns {number}
         */
        source.seek = function (position, whence) {
            source.pos = position;
            return source.pos;
        };

        source.readFull = function (length) {
            var buf = new Uint8Array(source.buf, source.pos, length);
            source.pos += buf.byteLength;
            return buf;
        };

        source.skipTags = function () {
            // TODO DELETE comment
            // var buf;
            // if (source.buf.length < 3) {
            //     buf = new Uint8Array(source.buf);
            // } else {
            //     buf = new Uint8Array(source.buf, 0, 3);
            // }

            var buf = source.readFull(3);

            // decode UTF-8
            var t = String.fromCharCode.apply(null, buf);
            switch (t) {
                case "TAG":
                    // TODO DELETE comment
                    // buf = new Uint8Array(source.buf, 3, Math.min(125, source.buf.byteLength));
                    buf = source.readFull(125);
                    break;
                case 'ID3':
                    // TODO DELETE comment
                    // Skip version (2 bytes) and flag (1 byte)
                    buf = source.readFull(3);

                    buf = source.readFull(4);
                    // TODO DELETE comment
                    // buf = new Uint8Array(source.buf, 6, Math.min(4, source.buf.byteLength));
                    if (buf.byteLength !== 4) {
                        return {
                            err: "data not enough."
                        };
                    }
                    var size = (((buf[0] >>> 0) << 21) >>> 0) | (((buf[1] >>> 0) << 14) >>> 0) | (((buf[2] >>> 0) << 7) >>> 0) | (buf[3] >>> 0);
                    buf = source.readFull(size);
                    // TODO DELETE comment
                    // buf = new Uint8Array(source.buf, 6 + buf.byteLength, Math.min(size, source.buf.byteLength));
                    break;
                default:
                    source.unread(buf);
                    break;
            }
        };

        source.unread = function (buf) {
            source.pos -= buf.byteLength
        };

        source.rewind = function() {
            source.pos = 0;
        };

        return source;
    },

    newDecoder: function (buf) {
        var s = Mp3.newSource(buf);

        var decoder = {
            source: s,
            sampleRate: 0,
            frame: null,
            frameStarts: [],
            buf: null,
            pos: 0,
            length: invalidLength
        };

        // ======= Methods of decoder :: start =========
        decoder.readFrame = function () {
            var result = Frame.read(decoder.source, decoder.source.pos);
            if (result.err) {
                return {
                    err: result.err
                }
            }
            decoder.frame = result.f;
            var pcm_buf = decoder.frame.decode();
            decoder.buf = util.concatBuffers(decoder.buf, pcm_buf);
            return null;
        };
        // ======= Methods of decoder :: end =========

        var r = s.skipTags();
        if (r && r.err) {
            return null;
        }

        var err = decoder.readFrame();
        if (err) {
            return null;
        }

        decoder.sampleRate = decoder.frame.samplingFrequency();
        return decoder;
    }
};

module.exports = Mp3;
