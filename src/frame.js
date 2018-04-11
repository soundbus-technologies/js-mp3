var consts = require('./consts');
var util = require('./util');
var Frameheader = require('./frameheader');
var Imdct = require('./imdct');
var Maindata = require('./maindata');
var Sideinfo = require('./sideinfo');

var powtab34 = new Float64Array(8207);
var pretab_data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 3, 3, 3, 2, 0];
var pretab = new Float64Array(pretab_data.length);
pretab.set(pretab_data);

for (var i = 0; i < powtab34.length; i++) {
    powtab34[i] = Math.pow(i, 4.0 / 3.0);
}

var synthNWin = [];
for (var i = 0; i < 64; i++) {
    synthNWin.push(new Float32Array(32));
}

for (var i = 0; i < 64; i++) {
    for (var j = 0; j < 32; j++) {
        synthNWin[i][j] = Math.cos(((16+i)*(2*j+1)) * (Math.PI / 64.0));
    }
}

var synthDtbl = new Float32Array([
    0.000000000, -0.000015259, -0.000015259, -0.000015259,
  -0.000015259, -0.000015259, -0.000015259, -0.000030518,
  -0.000030518, -0.000030518, -0.000030518, -0.000045776,
  -0.000045776, -0.000061035, -0.000061035, -0.000076294,
  -0.000076294, -0.000091553, -0.000106812, -0.000106812,
  -0.000122070, -0.000137329, -0.000152588, -0.000167847,
  -0.000198364, -0.000213623, -0.000244141, -0.000259399,
  -0.000289917, -0.000320435, -0.000366211, -0.000396729,
  -0.000442505, -0.000473022, -0.000534058, -0.000579834,
  -0.000625610, -0.000686646, -0.000747681, -0.000808716,
  -0.000885010, -0.000961304, -0.001037598, -0.001113892,
  -0.001205444, -0.001296997, -0.001388550, -0.001480103,
  -0.001586914, -0.001693726, -0.001785278, -0.001907349,
  -0.002014160, -0.002120972, -0.002243042, -0.002349854,
  -0.002456665, -0.002578735, -0.002685547, -0.002792358,
  -0.002899170, -0.002990723, -0.003082275, -0.003173828,
  0.003250122, 0.003326416, 0.003387451, 0.003433228,
  0.003463745, 0.003479004, 0.003479004, 0.003463745,
  0.003417969, 0.003372192, 0.003280640, 0.003173828,
  0.003051758, 0.002883911, 0.002700806, 0.002487183,
  0.002227783, 0.001937866, 0.001617432, 0.001266479,
  0.000869751, 0.000442505, -0.000030518, -0.000549316,
  -0.001098633, -0.001693726, -0.002334595, -0.003005981,
  -0.003723145, -0.004486084, -0.005294800, -0.006118774,
  -0.007003784, -0.007919312, -0.008865356, -0.009841919,
  -0.010848999, -0.011886597, -0.012939453, -0.014022827,
  -0.015121460, -0.016235352, -0.017349243, -0.018463135,
  -0.019577026, -0.020690918, -0.021789551, -0.022857666,
  -0.023910522, -0.024932861, -0.025909424, -0.026840210,
  -0.027725220, -0.028533936, -0.029281616, -0.029937744,
  -0.030532837, -0.031005859, -0.031387329, -0.031661987,
  -0.031814575, -0.031845093, -0.031738281, -0.031478882,
  0.031082153, 0.030517578, 0.029785156, 0.028884888,
  0.027801514, 0.026535034, 0.025085449, 0.023422241,
  0.021575928, 0.019531250, 0.017257690, 0.014801025,
  0.012115479, 0.009231567, 0.006134033, 0.002822876,
  -0.000686646, -0.004394531, -0.008316040, -0.012420654,
  -0.016708374, -0.021179199, -0.025817871, -0.030609131,
  -0.035552979, -0.040634155, -0.045837402, -0.051132202,
  -0.056533813, -0.061996460, -0.067520142, -0.073059082,
  -0.078628540, -0.084182739, -0.089706421, -0.095169067,
  -0.100540161, -0.105819702, -0.110946655, -0.115921021,
  -0.120697021, -0.125259399, -0.129562378, -0.133590698,
  -0.137298584, -0.140670776, -0.143676758, -0.146255493,
  -0.148422241, -0.150115967, -0.151306152, -0.151962280,
  -0.152069092, -0.151596069, -0.150497437, -0.148773193,
  -0.146362305, -0.143264771, -0.139450073, -0.134887695,
  -0.129577637, -0.123474121, -0.116577148, -0.108856201,
  0.100311279, 0.090927124, 0.080688477, 0.069595337,
  0.057617188, 0.044784546, 0.031082153, 0.016510010,
  0.001068115, -0.015228271, -0.032379150, -0.050354004,
  -0.069168091, -0.088775635, -0.109161377, -0.130310059,
  -0.152206421, -0.174789429, -0.198059082, -0.221984863,
  -0.246505737, -0.271591187, -0.297210693, -0.323318481,
  -0.349868774, -0.376800537, -0.404083252, -0.431655884,
  -0.459472656, -0.487472534, -0.515609741, -0.543823242,
  -0.572036743, -0.600219727, -0.628295898, -0.656219482,
  -0.683914185, -0.711318970, -0.738372803, -0.765029907,
  -0.791213989, -0.816864014, -0.841949463, -0.866363525,
  -0.890090942, -0.913055420, -0.935195923, -0.956481934,
  -0.976852417, -0.996246338, -1.014617920, -1.031936646,
  -1.048156738, -1.063217163, -1.077117920, -1.089782715,
  -1.101211548, -1.111373901, -1.120223999, -1.127746582,
  -1.133926392, -1.138763428, -1.142211914, -1.144287109,
  1.144989014, 1.144287109, 1.142211914, 1.138763428,
  1.133926392, 1.127746582, 1.120223999, 1.111373901,
  1.101211548, 1.089782715, 1.077117920, 1.063217163,
  1.048156738, 1.031936646, 1.014617920, 0.996246338,
  0.976852417, 0.956481934, 0.935195923, 0.913055420,
  0.890090942, 0.866363525, 0.841949463, 0.816864014,
  0.791213989, 0.765029907, 0.738372803, 0.711318970,
  0.683914185, 0.656219482, 0.628295898, 0.600219727,
  0.572036743, 0.543823242, 0.515609741, 0.487472534,
  0.459472656, 0.431655884, 0.404083252, 0.376800537,
  0.349868774, 0.323318481, 0.297210693, 0.271591187,
  0.246505737, 0.221984863, 0.198059082, 0.174789429,
  0.152206421, 0.130310059, 0.109161377, 0.088775635,
  0.069168091, 0.050354004, 0.032379150, 0.015228271,
  -0.001068115, -0.016510010, -0.031082153, -0.044784546,
  -0.057617188, -0.069595337, -0.080688477, -0.090927124,
  0.100311279, 0.108856201, 0.116577148, 0.123474121,
  0.129577637, 0.134887695, 0.139450073, 0.143264771,
  0.146362305, 0.148773193, 0.150497437, 0.151596069,
  0.152069092, 0.151962280, 0.151306152, 0.150115967,
  0.148422241, 0.146255493, 0.143676758, 0.140670776,
  0.137298584, 0.133590698, 0.129562378, 0.125259399,
  0.120697021, 0.115921021, 0.110946655, 0.105819702,
  0.100540161, 0.095169067, 0.089706421, 0.084182739,
  0.078628540, 0.073059082, 0.067520142, 0.061996460,
  0.056533813, 0.051132202, 0.045837402, 0.040634155,
  0.035552979, 0.030609131, 0.025817871, 0.021179199,
  0.016708374, 0.012420654, 0.008316040, 0.004394531,
  0.000686646, -0.002822876, -0.006134033, -0.009231567,
  -0.012115479, -0.014801025, -0.017257690, -0.019531250,
  -0.021575928, -0.023422241, -0.025085449, -0.026535034,
  -0.027801514, -0.028884888, -0.029785156, -0.030517578,
  0.031082153, 0.031478882, 0.031738281, 0.031845093,
  0.031814575, 0.031661987, 0.031387329, 0.031005859,
  0.030532837, 0.029937744, 0.029281616, 0.028533936,
  0.027725220, 0.026840210, 0.025909424, 0.024932861,
  0.023910522, 0.022857666, 0.021789551, 0.020690918,
  0.019577026, 0.018463135, 0.017349243, 0.016235352,
  0.015121460, 0.014022827, 0.012939453, 0.011886597,
  0.010848999, 0.009841919, 0.008865356, 0.007919312,
  0.007003784, 0.006118774, 0.005294800, 0.004486084,
  0.003723145, 0.003005981, 0.002334595, 0.001693726,
  0.001098633, 0.000549316, 0.000030518, -0.000442505,
  -0.000869751, -0.001266479, -0.001617432, -0.001937866,
  -0.002227783, -0.002487183, -0.002700806, -0.002883911,
  -0.003051758, -0.003173828, -0.003280640, -0.003372192,
  -0.003417969, -0.003463745, -0.003479004, -0.003479004,
  -0.003463745, -0.003433228, -0.003387451, -0.003326416,
  0.003250122, 0.003173828, 0.003082275, 0.002990723,
  0.002899170, 0.002792358, 0.002685547, 0.002578735,
  0.002456665, 0.002349854, 0.002243042, 0.002120972,
  0.002014160, 0.001907349, 0.001785278, 0.001693726,
  0.001586914, 0.001480103, 0.001388550, 0.001296997,
  0.001205444, 0.001113892, 0.001037598, 0.000961304,
  0.000885010, 0.000808716, 0.000747681, 0.000686646,
  0.000625610, 0.000579834, 0.000534058, 0.000473022,
  0.000442505, 0.000396729, 0.000366211, 0.000320435,
  0.000289917, 0.000259399, 0.000244141, 0.000213623,
  0.000198364, 0.000167847, 0.000152588, 0.000137329,
  0.000122070, 0.000106812, 0.000106812, 0.000091553,
  0.000076294, 0.000076294, 0.000061035, 0.000061035,
  0.000045776, 0.000045776, 0.000030518, 0.000030518,
  0.000030518, 0.000030518, 0.000015259, 0.000015259,
  0.000015259, 0.000015259, 0.000015259, 0.000015259,
], 0, 512);

var cs = new Float32Array([
  0.857493, 0.881742, 0.949629, 0.983315, 0.995518, 0.999161, 0.999899, 0.999993
]);

var ca = new Float32Array([
  -0.514496, -0.471732, -0.313377, -0.181913, -0.094574, -0.040966, -0.014199, -0.003700
]);

var isRatios = [0.000000, 0.267949, 0.577350, 1.000000, 1.732051, 3.732051];

var Frame = {
    createNew: function (header, sideInfo, mainData, mainDataBits) {
        var frame = {
            header: header,
            sideInfo: sideInfo,
            mainData: mainData,
            mainDataBits: mainDataBits
        };

        frame.store = new Array(2);
        for (var i = 0; i < frame.store.length; i++) {
            var a = new Array(32);
            for (var j = 0; j < a.length; j++) {
                a[j] = new Float32Array(18);
            }
            frame.store[i] = a;
        }

        frame.v_vec = new Array(2);
        for (var i = 0; i < frame.v_vec.length; i++) {
            frame.v_vec[i] = new Float32Array(1024);
        }

        /**
         * Return decoded pcm ArrayBuffer
         *
         * @constructor
         */
        frame.decode = function () {
            var out = new Uint8Array(consts.BytesPerFrame);
            var nch = frame.header.numberOfChannels();
            for (var gr = 0; gr < 2; gr++) {
                for (var ch = 0; ch < nch; ch++) {
                    frame.requantize(gr, ch);
                    frame.reorder(gr, ch);
                }
                frame.stereo(gr);
                for (var ch = 0; ch < nch; ch++) {
                    frame.antialias(gr, ch);
                    frame.hybridSynthesis(gr, ch);
                    frame.frequencyInversion(gr, ch);
                    frame.subbandSynthesis(gr, ch, out.subarray(consts.SamplesPerGr * 4 * gr));
                }
            }
            return out;
        };

        frame.antialias = function(gr, ch) {
            // No antialiasing is done for short blocks
            if ((frame.sideInfo.WinSwitchFlag[gr][ch] === 1) &&
                (frame.sideInfo.BlockType[gr][ch] === 2) &&
                (frame.sideInfo.MixedBlockFlag[gr][ch]) === 0) {
                return;
            }
            // Setup the limit for how many subbands to transform
            var sblim = 32;
            if ((frame.sideInfo.WinSwitchFlag[gr][ch] === 1) &&
                (frame.sideInfo.BlockType[gr][ch] === 2) &&
                (frame.sideInfo.MixedBlockFlag[gr][ch] === 1)) {
                sblim = 2
            }
            // Do the actual antialiasing
            for (var sb = 1; sb < sblim; sb++) {
                for (var i = 0; i < 8; i++) {
                    var li = 18*sb - 1 - i;
                    var ui = 18*sb + i;
                    var lb = frame.mainData.Is[gr][ch][li]*cs[i] - frame.mainData.Is[gr][ch][ui]*ca[i];
                    var ub = frame.mainData.Is[gr][ch][ui]*cs[i] + frame.mainData.Is[gr][ch][li]*ca[i];
                    frame.mainData.Is[gr][ch][li] = lb;
                    frame.mainData.Is[gr][ch][ui] = ub;
                }
            }
        };

        frame.hybridSynthesis = function (gr, ch) {
            // Loop through all 32 subbands
            for (var sb = 0; sb < 32; sb++) {
                // Determine blocktype for this subband
                var bt = frame.sideInfo.BlockType[gr][ch];
                if ((frame.sideInfo.WinSwitchFlag[gr][ch] === 1) &&
                    (frame.sideInfo.MixedBlockFlag[gr][ch] === 1) && (sb < 2)) {
                    bt = 0;
                }
                // Do the inverse modified DCT and windowing
                var inData = new Float32Array(18);
                for (var i = 0; i < 18; i++) {
                    inData[i] = frame.mainData.Is[gr][ch][sb*18+i];
                }
                // console.log('inData: ' + inData);
                // console.log('----------');
                var rawout = Imdct.Win(inData, bt);
                // console.log('rawout: ' + rawout);
                // Overlapp add with stored vector into main_data vector
                for (var i = 0; i < 18; i++) {
                    frame.mainData.Is[gr][ch][sb*18+i] = rawout[i] + frame.store[ch][sb][i];
                    frame.store[ch][sb][i] = rawout[i+18];
                }
            }
        };

        frame.frequencyInversion = function (gr, ch) {
            for (var sb = 1; sb < 32; sb += 2) {
                for (var i = 1; i < 18; i += 2) {
                    frame.mainData.Is[gr][ch][sb*18+i] = -frame.mainData.Is[gr][ch][sb*18+i];
                }
            }
        };

        frame.stereo = function (gr) {
            if (frame.header.useMSStereo()) {
                // Determine how many frequency lines to transform
                var i = 1;
                if (frame.sideInfo.Count1[gr][0] > frame.sideInfo.Count1[gr][1]) {
                    i = 0;
                }
                var max_pos = frame.sideInfo.Count1[gr][i];
                // Do the actual processing
                const invSqrt2 = Math.SQRT2 / 2;
                for (var i = 0; i < max_pos; i++) {
                    var left = (frame.mainData.Is[gr][0][i] + frame.mainData.Is[gr][1][i]) * invSqrt2;
                    var right = (frame.mainData.Is[gr][0][i] - frame.mainData.Is[gr][1][i]) * invSqrt2;
                    frame.mainData.Is[gr][0][i] = left;
                    frame.mainData.Is[gr][1][i] = right;
                }
            }

            if (frame.header.useIntensityStereo()) {
                // Setup sampling frequency index
                var sfreq = frame.header.samplingFrequency();

                // First band that is intensity stereo encoded is first band scale factor
                // band on or above count1 frequency line. N.B.: Intensity stereo coding is
                // only done for higher subbands, but logic is here for lower subbands.
                // Determine type of block to process
                if ((frame.sideInfo.WinSwitchFlag[gr][0] === 1) && (frame.sideInfo.BlockType[gr][0] === 2)) { // Short blocks
                    // Check if the first two subbands
                    // (=2*18 samples = 8 long or 3 short sfb's) uses long blocks
                    if (frame.sideInfo.MixedBlockFlag[gr][0] !== 0) { // 2 longbl. sb  first
                        for (var sfb = 0; sfb < 8; sfb++) { // First process 8 sfb's at start
                            // Is this scale factor band above count1 for the right channel?
                            if (consts.SfBandIndicesSet[sfreq].L[sfb] >= frame.sideInfo.Count1[gr][1]) {
                                frame.stereoProcessIntensityLong(gr, sfb);
                            }
                        }
                        // And next the remaining bands which uses short blocks
                        for (var sfb = 3; sfb < 12; sfb++) {
                            // Is this scale factor band above count1 for the right channel?
                            if (consts.SfBandIndicesSet[sfreq].S[sfb]*3 >= frame.sideInfo.Count1[gr][1]) {
                                frame.stereoProcessIntensityShort(gr, sfb);
                            }
                        }
                    } else { // Only short blocks
                        for (var sfb = 0; sfb < 12; sfb++) {
                            // Is this scale factor band above count1 for the right channel?
                            if (consts.SfBandIndicesSet[sfreq].S[sfb]*3 >= frame.sideInfo.Count1[gr][1]) {
                                frame.stereoProcessIntensityShort(gr, sfb);
                            }
                        }
                    }
                } else { // Only long blocks
                    for (var sfb = 0; sfb < 21; sfb++) {
                        // Is this scale factor band above count1 for the right channel?
                        if (consts.SfBandIndicesSet[sfreq].L[sfb] >= frame.sideInfo.Count1[gr][1]) {
                            frame.stereoProcessIntensityLong(gr, sfb);
                        }
                    }
                }
            }
        };

        frame.stereoProcessIntensityLong = function (gr, sfb) {
            var is_ratio_l = 0.0;
            var is_ratio_r = 0.0;
            // Check that((is_pos[sfb]=scalefac) < 7) => no intensity stereo
            var is_pos = frame.mainData.ScalefacL[gr][0][sfb];
            if (is_pos < 7) {
                var sfreq = frame.header.samplingFrequency().value; // Setup sampling freq index
                var sfb_start = consts.SfBandIndicesSet[sfreq].L[sfb];
                var sfb_stop = consts.SfBandIndicesSet[sfreq].L[sfb+1];
                if (is_pos === 6) { // tan((6*PI)/12 = PI/2) needs special treatment!
                    is_ratio_l = 1.0;
                    is_ratio_r = 0.0;
                } else {
                    is_ratio_l = isRatios[is_pos] / (1.0 + isRatios[is_pos]);
                    is_ratio_r = 1.0 / (1.0 + isRatios[is_pos]);
                }
                // Now decode all samples in this scale factor band
                for (var i = sfb_start; i < sfb_stop; i++) {
                    frame.mainData.Is[gr][0][i] *= is_ratio_l;
                    frame.mainData.Is[gr][1][i] *= is_ratio_r;
                }
            }
        };

        frame.stereoProcessIntensityShort = function (gr, sfb) {
            var is_ratio_l = 0.0;
            var is_ratio_r = 0.0;
            var sfreq = frame.header.samplingFrequency().value; // Setup sampling freq index
            // The window length
            var win_len = consts.SfBandIndicesSet[sfreq].S[sfb+1] - consts.SfBandIndicesSet[sfreq].S[sfb];
            // The three windows within the band has different scalefactors
            for (var win = 0; win < 3; win++) {
                // Check that((is_pos[sfb]=scalefac) < 7) => no intensity stereo
                var is_pos = frame.mainData.ScalefacS[gr][0][sfb][win];
                if (is_pos < 7) {
                    var sfb_start = consts.SfBandIndicesSet[sfreq].S[sfb]*3 + win_len*win;
                    var sfb_stop = sfb_start + win_len;
                    if (is_pos === 6) { // tan((6*PI)/12 = PI/2) needs special treatment!
                        is_ratio_l = 1.0;
                        is_ratio_r = 0.0;
                    } else {
                        is_ratio_l = isRatios[is_pos] / (1.0 + isRatios[is_pos]);
                        is_ratio_r = 1.0 / (1.0 + isRatios[is_pos]);
                    }
                    // Now decode all samples in this scale factor band
                    for (var i = sfb_start; i < sfb_stop; i++) {
                        // https://github.com/technosaurus/PDMP3/issues/3
                        frame.mainData.Is[gr][0][i] *= is_ratio_l;
                        frame.mainData.Is[gr][1][i] *= is_ratio_r;
                    }
                }
            }
        };

        frame.requantize = function (gr, ch) {
            // Setup sampling frequency index
            var sfreq = frame.header.samplingFrequency().value;
            // Determine type of block to process
            if (frame.sideInfo.WinSwitchFlag[gr][ch] === 1 && frame.sideInfo.BlockType[gr][ch]
                                                              === 2) { // Short blocks
                // Check if the first two subbands
                // (=2*18 samples = 8 long or 3 short sfb's) uses long blocks
                if (frame.sideInfo.MixedBlockFlag[gr][ch] !== 0) { // 2 longbl. sb  first
                    // First process the 2 long block subbands at the start
                    var sfb = 0;
                    var next_sfb = consts.SfBandIndicesSet[sfreq].L[sfb + 1];
                    for (var i = 0; i < 36; i++) {
                        if (i === next_sfb) {
                            sfb++;
                            next_sfb = consts.SfBandIndicesSet[sfreq].L[sfb + 1];
                        }
                        frame.requantizeProcessLong(gr, ch, i, sfb);
                    }
                    // And next the remaining,non-zero,bands which uses short blocks
                    sfb = 3;
                    next_sfb = consts.SfBandIndicesSet[sfreq].S[sfb + 1] * 3;
                    var win_len = consts.SfBandIndicesSet[sfreq].S[sfb + 1] -
                                  consts.SfBandIndicesSet[sfreq].S[sfb];

                    for (var i = 36; i < int(f.sideInfo.Count1[gr][ch]);) /* i++ done below! */ {
                        // Check if we're into the next scalefac band
                        if (i === next_sfb) {
                            sfb++;
                            next_sfb = consts.SfBandIndicesSet[sfreq].S[sfb + 1] * 3;
                            win_len = consts.SfBandIndicesSet[sfreq].S[sfb + 1] -
                                      consts.SfBandIndicesSet[sfreq].S[sfb];
                        }
                        for (var win = 0; win < 3; win++) {
                            for (var j = 0; j < win_len; j++) {
                                frame.requantizeProcessShort(gr, ch, i, sfb, win);
                                i++;
                            }
                        }
                    }
                } else { // Only short blocks
                    var sfb = 0;
                    var next_sfb = consts.SfBandIndicesSet[sfreq].S[sfb + 1] * 3;
                    var win_len = consts.SfBandIndicesSet[sfreq].S[sfb + 1] -
                                  consts.SfBandIndicesSet[sfreq].S[sfb];
                    for (var i = 0; i < frame.sideInfo.Count1[gr][ch];) /* i++ done below! */ {
                        // Check if we're into the next scalefac band
                        if (i === next_sfb) {
                            sfb++;
                            next_sfb = consts.SfBandIndicesSet[sfreq].S[sfb + 1] * 3;
                            win_len = consts.SfBandIndicesSet[sfreq].S[sfb + 1] -
                                      consts.SfBandIndicesSet[sfreq].S[sfb];
                        }
                        for (var win = 0; win < 3; win++) {
                            for (var j = 0; j < win_len; j++) {
                                frame.requantizeProcessShort(gr, ch, i, sfb, win);
                                i++;
                            }
                        }
                    }
                }
            } else { // Only long blocks
                var sfb = 0;
                var next_sfb = consts.SfBandIndicesSet[sfreq].L[sfb + 1];
                for (var i = 0; i < frame.sideInfo.Count1[gr][ch]; i++) {
                    if (i === next_sfb) {
                        sfb++;
                        next_sfb = consts.SfBandIndicesSet[sfreq].L[sfb + 1];
                    }
                    frame.requantizeProcessLong(gr, ch, i, sfb);
                }
            }
        };

        frame.requantizeProcessLong = function (gr, ch, is_pos, sfb) {
            var sf_mult = 0.5;
            if (frame.sideInfo.ScalefacScale[gr][ch] !== 0) {
                sf_mult = 1.0;
            }
            var pf_x_pt = frame.sideInfo.Preflag[gr][ch] * pretab[sfb];
            var idx = -(sf_mult * (frame.mainData.ScalefacL[gr][ch][sfb] + pf_x_pt)) +
                      0.25 * (frame.sideInfo.GlobalGain[gr][ch] - 210);
            var tmp1 = Math.pow(2.0, idx);
            var tmp2 = 0.0;
            if (frame.mainData.Is[gr][ch][is_pos] < 0.0) {
                tmp2 = -powtab34[-frame.mainData.Is[gr][ch][is_pos]];
            } else {
                tmp2 = powtab34[frame.mainData.Is[gr][ch][is_pos]];
            }
            frame.mainData.Is[gr][ch][is_pos] = tmp1 * tmp2;
        };

        frame.requantizeProcessShort = function (gr, ch, is_pos, sfb, win) {
            var sf_mult = 0.5;
            if (frame.sideInfo.ScalefacScale[gr][ch] !== 0) {
                sf_mult = 1.0;
            }
            var idx = -(sf_mult * frame.mainData.ScalefacS[gr][ch][sfb][win]) +
                   0.25*(frame.sideInfo.GlobalGain[gr][ch]-210.0-
                         8.0*frame.sideInfo.SubblockGain[gr][ch][win]);
            var tmp1 = Math.pow(2.0, idx);
            var tmp2 = 0.0;
            if (frame.mainData.Is[gr][ch][is_pos] < 0) {
                tmp2 = -powtab34[-frame.mainData.Is[gr][ch][is_pos]];
            } else {
                tmp2 = powtab34[frame.mainData.Is[gr][ch][is_pos]];
            }
            frame.mainData.Is[gr][ch][is_pos] = tmp1 * tmp2;
        };

        frame.reorder = function (gr, ch) {
            var re = new Float32Array(consts.SamplesPerGr);
            var sfreq = frame.header.samplingFrequency().value;   // Setup sampling freq index
            // Only reorder short blocks
            if ((frame.sideInfo.WinSwitchFlag[gr][ch] === 1) && (frame.sideInfo.BlockType[gr][ch] == 2)) { // Short blocks
                // Check if the first two subbands
                // (=2*18 samples = 8 long or 3 short sfb's) uses long blocks
                var sfb = 0;
                // 2 longbl. sb  first
                if (frame.sideInfo.MixedBlockFlag[gr][ch] !== 0) {
                    sfb = 3;
                }
                var next_sfb = consts.SfBandIndicesSet[sfreq].S[sfb+1] * 3;
                var win_len = consts.SfBandIndicesSet[sfreq].S[sfb+1] - consts.SfBandIndicesSet[sfreq].S[sfb];
                var i = 36;
                if (sfb === 0) {
                    i = 0;
                }
                for (;i < consts.SamplesPerGr;) {
                    // Check if we're into the next scalefac band
                    if (i === next_sfb) {
                        // Copy reordered data back to the original vector
                        var j = 3 * consts.SfBandIndicesSet[sfreq].S[sfb];
                        for (var s = 0; s < 3*win_len; s++) {
                            frame.mainData.Is[gr][ch][j + s] = re[s]; // copy(frame.mainData.Is[gr][ch][j:j+3*win_len], re[0:3*win_len])
                        }
                        // Check if this band is above the rzero region,if so we're done
                        if (i >= frame.sideInfo.Count1[gr][ch]) {
                            return;
                        }
                        sfb++;
                        next_sfb = consts.SfBandIndicesSet[sfreq].S[sfb+1] * 3;
                        win_len = consts.SfBandIndicesSet[sfreq].S[sfb+1] - consts.SfBandIndicesSet[sfreq].S[sfb];
                    }
                    for (var win = 0; win < 3; win++) { // Do the actual reordering
                        for (j = 0; j < win_len; j++) {
                            re[j*3+win] = frame.mainData.Is[gr][ch][i];
                            i++;
                        }
                    }
                }
                // Copy reordered data of last band back to original vector
                var j = 3 * consts.SfBandIndicesSet[sfreq].S[12];
                for (var s = 0; s < 3*win_len; s++) {
                    frame.mainData.Is[gr][ch][j + s] = re[s]; // copy(frame.mainData.Is[gr][ch][j:j+3*win_len], re[0:3*win_len])
                }
            }
        };

        frame.subbandSynthesis = function (gr, ch, out) {
            var u_vec = new Float32Array(512);
            var s_vec = new Float32Array(32);

            var nch = frame.header.numberOfChannels();
            // Setup the n_win windowing vector and the v_vec intermediate vector
            for (var ss = 0; ss < 18; ss++) { // Loop through 18 samples in 32 subbands
                frame.v_vec[ch].set(frame.v_vec[ch].slice(0, 1024-64), 64); // copy(f.v_vec[ch][64:1024], f.v_vec[ch][0:1024-64])
                // for (var s = 0; s < 1024 - 64;) {
                //     frame.v_vec[ch][64+s] = frame.v_vec[ch][s]; // copy(f.v_vec[ch][64:1024], f.v_vec[ch][0:1024-64])
                //     s++;
                // }

                var d = frame.mainData.Is[gr][ch];
                for ( var i = 0; i < 32; i++) { // Copy next 32 time samples to a temp vector
                    s_vec[i] = d[i*18+ss];
                }
                for (var i = 0; i < 64; i++) { // Matrix multiply input with n_win[][] matrix
                    var sum = 0;
                    for (var j = 0; j < 32; j++) {
                        sum += synthNWin[i][j] * s_vec[j];
                    }
                    frame.v_vec[ch][i] = sum;
                }
                var v = frame.v_vec[ch];
                for (var i = 0; i < 512; i += 64) { // Build the U vector
                    u_vec.set(v.slice((i<<1) >>> 0, ((i<<1) >>> 0)+32), i); // copy(u_vec[i:i+32], v[(i<<1):(i<<1)+32])
                    u_vec.set(v.slice(((i<<1) >>> 0) + 96, ((i<<1) >>> 0)+128), i+32); // copy(u_vec[i+32:i+64], v[(i<<1)+96:(i<<1)+128])
                    // for (var s = 0; s < 32; s++) {  // copy(u_vec[i:i+32], v[(i<<1):(i<<1)+32])
                    //     u_vec[i+s] = v[(i<<1) + s];
                    // }
                    // for (var s = 0; s < 32; s++) {  // copy(u_vec[i+32:i+64], v[(i<<1)+96:(i<<1)+128])
                    //     u_vec[i+32+s] = v[(i<<1)+96+s];
                    // }
                }
                for (var i = 0; i < 512; i++) { // Window by u_vec[i] with synthDtbl[i]
                    u_vec[i] *= synthDtbl[i];
                }
                for (var i = 0; i < 32; i++) { // Calc 32 samples,store in outdata vector
                    var sum = 0;
                    for (var j = 0; j < 512; j += 32) {
                        sum += u_vec[j+i];
                    }
                    // sum now contains time sample 32*ss+i. Convert to 16-bit signed int
                    var samp = sum * 32767;
                    if (samp > 32767) {
                        samp = 32767;
                    } else if (samp < -32767) {
                        samp = -32767;
                    }
                    var s = samp;
                    var idx = 4 * (32*ss + i);
                    if (nch === 1) {
                        // We always run in stereo mode and duplicate channels here for mono.
                        out[idx] = s;
                        out[idx+1] = (s >>> 8) >>> 0;
                        out[idx+2] = s;
                        out[idx+3] = (s >>> 8) >>> 0;
                        continue;
                    }
                    if (ch === 0) {
                        out[idx] = s;
                        out[idx+1] = (s >>> 8) >>> 0;
                    } else {
                        out[idx+2] = s;
                        out[idx+3] = (s >>> 8) >>> 0;
                    }
                }
            }
            return out;
        };

        frame.samplingFrequency = function () {
            return frame.header.samplingFrequency().Int();
        };

        return frame;
    },

    readCRC: function (source) {
        var result = source.readFull(2);
        if (result.err) {
            return {
                err: result.err
            }
        }
        var buf = result.buf;
        if (buf.byteLength < 2) {
            return "mp3: error at readCRC";
        }
    },

    read: function (source, position, prev) {
        var rr = Frameheader.read(source, position)
        if (rr.err) {
            return {
                f: null,
                position: 0,
                err: rr.err
            }
        }

        var pos = rr.position;
        var fh = rr.h;
        // pos = rr.stopPosition;
        if (fh.protectionBit() === 0) {
            // pos += 2;
            var err = Frame.readCRC(source);
            if (typeof(err) !== 'undefined') {
                return {
                    f: null,
                    position: 0,
                    err: err
                }
            }
        }

        if (fh.id() !== consts.Version1) {
            return {
                f: null,
                position: 0,
                err: "mp3: only MPEG version 1 (want " + consts.Version1 + "; got " + fh.id()
                     + ") is supported"
            }
        }
        if (fh.layer() !== consts.Layer3) {
            return {
                f: null,
                position: 0,
                err: "mp3: only layer3 (want " + consts.Version1 + "; got " + fh.layer()
                     + ") is supported"
            }
        }

        var result = Sideinfo.read(source, fh, pos);
        if (result.err) {
            return {
                f: null,
                position: 0,
                err: result.err
            }
        }
        var si = result.v;

        // If there's not enough main data in the bit reservoir,
        // signal to calling function so that decoding isn't done!
        // Get main data (scalefactors and Huffman coded frequency data)
        var prevM = null;
        if (prev) {
            prevM = prev.mainDataBits;
        }

        result = Maindata.read(source, prevM, fh, si);
        if (result.err) {
            return {
                f: null,
                position: 0,
                err: result.err
            }
        }

        var f = Frame.createNew(fh, si, result.v, result.bits);
        if (prev) {
            f.store = prev.store;
            f.v_vec = prev.v_vec;
        }

        return {
            f: f,
            position: pos,
            err: null
        };
    }
};

module.exports = Frame;
