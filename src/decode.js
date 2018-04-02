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
            return source.pos
        };

        source.skipTags = function () {
            var buf;
            if (source.buf.length < 3) {
                buf = new Uint8Array(source.buf);
            } else {
                buf = new Uint8Array(source.buf, 0, 3);
            }

            // decode UTF-8
            var t = String.fromCharCode.apply(null, buf);
            switch (t) {
                case "TAG":
                    buf = new Uint8Array(source.buf, 3, Math.min(125, source.buf.byteLength));
                    break;
                case 'ID3':
                    // Skip version (2 bytes) and flag (1 byte), so from offset 6
                    buf = new Uint8Array(source.buf, 6, Math.min(4, source.buf.byteLength));
                    if (buf.byteLength !== 4) {
                        return;
                    }
                    var size = (((buf[0] >>> 0) << 21) >>> 0) | (((buf[1] >>> 0) << 14) >>> 0) | (((buf[2] >>> 0) << 7) >>> 0) | (buf[3] >>> 0);
                    buf = new Uint8Array(source.buf, 6 + buf.byteLength, Math.min(size, source.buf.byteLength));
                    break;
                default:
                    buf = null;
                    break;
            }
        };

        return source;
    }
};

module.exports = Mp3;
