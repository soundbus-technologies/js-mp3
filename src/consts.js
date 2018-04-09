var consts = {
    Version2_5: 0,
    VersionReserved: 1,
    Version2: 2,
    Version1: 3,

    LayerReserved: 0,
    Layer3: 1,
    Layer2: 2,
    Layer1: 3,

    ModeStereo: 0,
    ModeJointStereo: 1,
    ModeDualChannel: 2,
    ModeSingleChannel: 3,

    SamplesPerGr: 576,

    SamplingFrequency44100: 0,
    SamplingFrequency48000: 1,
    SamplingFrequency32000: 2,
    SamplingFrequencyReserved: 3,

    newSamplingFrequencyInstance: function (value) {
        var instance = {
            value: value
        };
        instance.Int = function () {
            switch(instance.value) {
                case consts.SamplingFrequency44100:
                    return 44100;
                case consts.SamplingFrequency48000:
                    return 48000;
                case consts.SamplingFrequency32000:
                    return 32000;
            }
            throw new Error('not reached');
        };
        return instance;
    },

    SfBandIndicesSet: {
        0: { // SamplingFrequency44100
            L: [0, 4, 8, 12, 16, 20, 24, 30, 36, 44, 52, 62, 74, 90, 110, 134, 162, 196, 238, 288, 342, 418, 576],
            S: [0, 4, 8, 12, 16, 22, 30, 40, 52, 66, 84, 106, 136, 192]
        },
        1: { // SamplingFrequency48000
            L: [0, 4, 8, 12, 16, 20, 24, 30, 36, 42, 50, 60, 72, 88, 106, 128, 156, 190, 230, 276, 330, 384, 576],
            S: [0, 4, 8, 12, 16, 22, 28, 38, 50, 64, 80, 100, 126, 192]
        },
        2: { // SamplingFrequency32000
            L: [0, 4, 8, 12, 16, 20, 24, 30, 36, 44, 54, 66, 82, 102, 126, 156, 194, 240, 296, 364, 448, 550, 576],
            S: [0, 4, 8, 12, 16, 22, 30, 42, 58, 78, 104, 138, 180, 192]
        }
    }
};

consts.BytesPerFrame = consts.SamplesPerGr * 2 * 4;

module.exports = consts;
