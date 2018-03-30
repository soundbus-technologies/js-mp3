var Bits = {
    createNew: function (vec) {
        var bits = {
            vec: vec, // ArrayBuffer
            bitPos: 0,
            bytePos: 0
        };

        /**
         * @return {number}
         */
        bits.Bit = function () {
            if (bits.vec.byteLength <= bits.bytePos) {
                // TODO: Should this return error?
                return 0;
            }
            var dv = new DataView(bits.vec, bits.bytePos);
            var tmp = (dv.getUint8(0) >>> (7 - bits.bitPos)) >>> 0;
            tmp &= 0x01;
            bits.bytePos += ((bits.bitPos + 1) >>> 3) >>> 0;
            bits.bitPos = (bits.bitPos + 1) & 0x07;
            return tmp;
        };

        /**
         * @return {number}
         */
        bits.Bits = function (num) {
            if (num === 0) {
                return 0;
            }
            if (bits.vec.byteLength <= bits.bytePos) {
                // TODO: Should this return error?
                return 0;
            }
            var bb = new DataView(bits.vec, bits.bytePos);
            // always end bit wise ops with >>> 0 so the result gets interpreted as unsigned.
            // don't use >>. If the left-most bit is 1 it will try to preseve the sign and thus will introduce 1's to the left. Always use >>>.
            // see https://stackoverflow.com/a/6798829
            var tmp = (((bb.getUint8(0) << 24) >>> 0) | ((bb.getUint8(1) << 16) >>> 0) | ((bb.getUint8(2) << 8) >>> 0) | (bb.byteLength === 3 ? 0 : (bb.getUint8(3) >>> 0))) >>> 0;
            tmp = (tmp << bits.bitPos) >>> 0;
            tmp = (tmp >>> (32 - num)) >>> 0;
            bits.bytePos += ((bits.bitPos + num) >>> 3) >>> 0;
            bits.bitPos = (bits.bitPos + num) & 0x07;
            return tmp;
        };

        return bits;
    },
    append: function (bits, buf) {
        return Bits.createNew(bits.vec.concat(buf));
    }
};

module.exports = Bits;
