var consts = require('./consts');

var Frameheader = {
    createNew: function (value) {
        // A mepg1FrameHeader is MPEG1 Layer 1-3 frame header
        var fh = {
            value: value
        };

        /**
         * ID returns this header's ID stored in position 20,19
         *
         * @return {number}
         */
        fh.id = function () {
            return ((fh.value & 0x00180000) >>> 19) >>> 0;
        };

        /**
         * Layer returns the mpeg layer of this frame stored in position 18,17
         *
         * @return {number}
         */
        fh.layer = function () {
            return ((fh.value & 0x00060000) >>> 17) >>> 0;
        };

        /**
         * ProtectionBit returns the protection bit stored in position 16
         *
         * @return {number}
         */
        fh.protectionBit = function () {
            return ((fh.value & 0x00010000) >>> 16) >>> 0;
        };

        /**
         * BirateIndex returns the bitrate index stored in position 15,12
         *
         * @return {number}
         */
        fh.bitrateIndex = function () {
            return ((fh.value & 0x0000f000) >>> 12) >>> 0;
        };

        /**
         * SamplingFrequency returns the SamplingFrequency in Hz stored in position 11,10
         *
         * @returns {*}
         * @constructor
         */
        fh.samplingFrequency = function () {
            return consts.newSamplingFrequencyInstance(((fh.value & 0x00000c00) >>> 10) >>> 0)
        };

        /**
         * PaddingBit returns the padding bit stored in position 9
         *
         * @return {number}
         */
        fh.paddingBit = function () {
            return ((fh.value & 0x00000200) >>> 9) >>> 0;
        };

        /**
         * PrivateBit returns the private bit stored in position 8 - this bit may be used to store
         * arbitrary data to be used by an application
         *
         * @return {number}
         */
        fh.privateBit = function () {
            return ((fh.value & 0x00000100) >>> 8) >>> 0;
        };

        /**
         * Mode returns the channel mode, stored in position 7,6
         *
         * @return {number}
         */
        fh.mode = function () {
            return ((fh.value & 0x000000c0) >>> 6) >>> 0;
        };

        /**
         * modeExtension returns the mode_extension - for use with Joint Stereo - stored in
         * position 4,5
         *
         * @returns {number}
         */
        fh.modeExtension = function () {
            return ((fh.value & 0x00000030) >>> 4) >>> 0;
        };

        /**
         * UseMSStereo returns a boolean value indicating whether the frame uses middle/side stereo.
         *
         * @returns {*}
         */
        fh.useMSStereo = function () {
            if (fh.mode() !== consts.ModeJointStereo) {
                return false;
            }
            return (fh.modeExtension() & 0x2) !== 0;
        };

        /**
         * UseIntensityStereo returns a boolean value indicating whether the frame uses intensity
         * stereo.
         *
         * @returns {*}
         */
        fh.useIntensityStereo = function () {
            if (fh.mode() !== consts.ModeJointStereo) {
                return false;
            }
            return (fh.modeExtension() & 0x1) !== 0;
        };

        /**
         * Copyright returns whether or not this recording is copywritten - stored in position 3
         *
         * @returns {number}
         */
        fh.copyright = function () {
            return ((fh.value & 0x00000008) >>> 3) >>> 0;
        };

        /**
         * OriginalOrCopy returns whether or not this is an Original recording or a copy of one -
         * stored in position 2
         *
         * @returns {number}
         */
        fh.originalOrCopy = function () {
            return ((fh.value & 0x00000004) >>> 2) >>> 0;
        };

        /**
         * Emphasis returns emphasis - the emphasis indication is here to tell the decoder that the
         * file must be de-emphasized - stored in position 0,1
         *
         * @returns {number}
         */
        fh.emphasis = function () {
            return (fh.value & 0x00000003) >>> 0;
        };

        /**
         * IsValid returns a boolean value indicating whether the header is valid or not.
         *
         * @returns {boolean}
         */
        fh.isValid = function () {
            const sync = 0xffe00000;
            if ((fh.value & sync) >>> 0 !== sync) {
                return false;
            }
            if (fh.id() === consts.VersionReserved) {
                return false;
            }
            if (fh.bitrateIndex() === 15) {
                return false;
            }
            if (fh.samplingFrequency().value === consts.SamplingFrequencyReserved) {
                return false;
            }
            if (fh.layer() === consts.LayerReserved) {
                return false;
            }
            if (fh.emphasis() === 2) {
                return false;
            }
            return true;
        };

        /**
         * @returns {number}
         */
        fh.frameSize = function () {
            return (144 * Frameheader.bitrate(fh.layer(), fh.bitrateIndex()))
                   / fh.samplingFrequency.Int()
                   + fh.paddingBit();
        };

        /**
         * @returns {number}
         */
        fh.numberOfChannels = function () {
            if (fh.mode() === consts.ModeSingleChannel) {
                return 1;
            }
            return 2;
        };

        return fh;
    },

    bitrate: function (layer, index) {
        switch (layer) {
            case consts.Layer1:
                return [0, 32000, 64000, 96000, 128000, 160000, 192000, 224000,
                        256000, 288000, 320000, 352000, 384000, 416000, 448000][index];
            case consts.Layer2:
                return [0, 32000, 48000, 56000, 64000, 80000, 96000, 112000,
                        128000, 160000, 192000, 224000, 256000, 320000, 384000][index];
            case consts.Layer3:
                return [0, 32000, 40000, 48000, 56000, 64000, 80000, 96000,
                        112000, 128000, 160000, 192000, 224000, 256000, 320000][index];
        }
        throw new Error('not reached');
    },

    read: function (source, position) {
        var stopPosition = 4;
        if (source.byteLength < stopPosition) {
            return {
                h: 0,
                position: 0,
                err: "UnexpectedEOF readHeader (1)"
            }
        }

        var buf = new Uint8Array(source, 0, stopPosition);
        var b1 = buf[0] >>> 0;
        var b2 = buf[1] >>> 0;
        var b3 = buf[2] >>> 0;
        var b4 = buf[3] >>> 0;

        var fh = Frameheader.createNew((((b1 << 24) >>> 0) | ((b2 << 16) >>> 0) | ((b3 << 8) >>> 0) | ((b4 << 0) >>> 0)) >>> 0);
        while (!fh.isValid()) {
            stopPosition++;
            try {
                buf = new Uint8Array(source, stopPosition - 4, stopPosition);
            } catch (e) {
                return {
                    h: 0,
                    position: 0,
                    err: "UnexpectedEOF readHeader (2)"
                }
            }

            b1 = buf[0] >>> 0;
            b2 = buf[1] >>> 0;
            b3 = buf[2] >>> 0;
            b4 = buf[3] >>> 0;

            fh = Frameheader.createNew((((b1 << 24) >>> 0) | ((b2 << 16) >>> 0) | ((b3 << 8) >>> 0) | ((b4 << 0) >>> 0)) >>> 0);
            position++;
        }

        // If we get here we've found the sync word, and can decode the header
        // which is in the low 20 bits of the 32-bit sync+header word.
        if (fh.bitrateIndex() === 0) {
            return {
                h: 0,
                position: 0,
                err: "mp3: free bitrate format is not supported. Header word is " + fh.value + " at position " + position
            }
        }

        return {
            h: fh,
            position: position
        }
    }
};

module.exports = Frameheader;
