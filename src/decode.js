var Frame = require('./frame');
var util = require('./util');
var consts = require('./consts');
var Frameheader = require('./frameheader');

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
         */
        source.seek = function (position) {
            if (position < 0 || position > source.buf.byteLength) {
                return {
                    err: "position not correct"
                }
            }
            source.pos = position;
            return {
                pos: source.pos
            };
        };

        source.readFull = function (length) {
            try {
                var l = Math.min(source.buf.byteLength - source.pos, length);
                var buf = new Uint8Array(source.buf, source.pos, l);
                source.pos += buf.byteLength;
                return {
                    buf: buf,
                    err: null
                };
            } catch (e) {
                return {
                    buf: null,
                    err: e.toString()
                }
            }
        };

        source.getPos = function () {
            if (source.pos > 3) {
                return source.pos - 3; // skip tags
            }
            return source.pos;
        };

        source.skipTags = function () {
            // TODO DELETE comment
            // var buf;
            // if (source.buf.length < 3) {
            //     buf = new Uint8Array(source.buf);
            // } else {
            //     buf = new Uint8Array(source.buf, 0, 3);
            // }

            var result = source.readFull(3);
            if (result.err) {
                return {
                    err: result.err
                }
            }
            var buf = result.buf;

            // decode UTF-8
            var t = String.fromCharCode.apply(null, buf);
            switch (t) {
                case "TAG":
                    // TODO DELETE comment
                    // buf = new Uint8Array(source.buf, 3, Math.min(125, source.buf.byteLength));
                    result = source.readFull(125);
                    if (result.err) {
                        return {
                            err: result.err
                        }
                    }
                    buf = result.buf;
                    break;
                case 'ID3':
                    // TODO DELETE comment
                    // Skip version (2 bytes) and flag (1 byte)
                    result = source.readFull(3);
                    if (result.err) {
                        return {
                            err: result.err
                        }
                    }

                    result = source.readFull(4);
                    if (result.err) {
                        return {
                            err: result.err
                        }
                    }
                    buf = result.buf;
                    // TODO DELETE comment
                    // buf = new Uint8Array(source.buf, 6, Math.min(4, source.buf.byteLength));
                    if (buf.byteLength !== 4) {
                        return {
                            err: "data not enough."
                        };
                    }
                    var size = (((buf[0] >>> 0) << 21) >>> 0) | (((buf[1] >>> 0) << 14) >>> 0) | (((buf[2] >>> 0) << 7) >>> 0) | (buf[3] >>> 0);
                    result = source.readFull(size);
                    if (result.err) {
                        return {
                            err: result.err
                        }
                    }
                    buf = result.buf;
                    // TODO DELETE comment
                    // buf = new Uint8Array(source.buf, 6 + buf.byteLength, Math.min(size, source.buf.byteLength));
                    break;
                default:
                    source.unread(buf);
                    break;
            }
            return {};
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
            var result = Frame.read(decoder.source, decoder.source.pos, decoder.frame);
            if (result.err) {
                return {
                    err: result.err
                }
            }
            decoder.frame = result.f;
            var pcm_buf = decoder.frame.decode();
            decoder.buf = util.concatBuffers(decoder.buf, pcm_buf);
            // console.log('decoder.buf: ' + new Uint8Array(decoder.buf));
            return {};
        };

        decoder.decode = function () {
            var result;
            while(true) {
                result = decoder.readFrame();
                if (result.err) {
                    break;
                }
            }
            return decoder.buf;
        };

        decoder.ensureFrameStartsAndLength = function () {
            if (decoder.length !== invalidLength) {
                return {}
            }

            var pos = decoder.source.pos;

            decoder.source.rewind();

            var r = decoder.source.skipTags();
            if (r.err) {
                return {
                    err: r.err
                }
            }

            var l = 0;
            while(true) {
                var result = Frameheader.read(decoder.source, decoder.source.pos);
                if (result.err) {
                    if (result.err.toString().indexOf("UnexpectedEOF") > -1) {
                        break;
                    }
                    return {
                        err: result.err
                    };
                }
                decoder.frameStarts.push(result.position);
                l += consts.BytesPerFrame;

                result = decoder.source.readFull(result.h.frameSize() - 4); // move to next frame position
                if (result.err) {
                    break;
                }
            }
            decoder.length = l;

            var result = decoder.source.seek(pos); // reset to beginning position
            if (result.err) {
                return resu
            }

            return {};
        };
        // ======= Methods of decoder :: end =========

        var r = s.skipTags();
        if (r && r.err) {
            return null;
        }

        var result = decoder.readFrame();
        if (result.err) {
            return null;
        }

        decoder.sampleRate = decoder.frame.samplingFrequency();

        result = decoder.ensureFrameStartsAndLength();
        if (result.err) {
            return null;
        }

        return decoder;
    }
};

module.exports = Mp3;
