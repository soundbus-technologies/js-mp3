var Bits = require('./bits');
var consts = require('./consts');
var util = require('./util');

var Sideinfo = {
    createNew: function () {
        // A SideInfo is MPEG1 Layer 3 Side Information.
        // [2][2] means [gr][ch].
        // MainDataBegin    int       // 9 bits
        // PrivateBits      int       // 3 bits in mono, 5 in stereo
        // Scfsi            [2][4]int // 1 bit
        // Part2_3Length    [2][2]int // 12 bits
        // BigValues        [2][2]int // 9 bits
        // GlobalGain       [2][2]int // 8 bits
        // ScalefacCompress [2][2]int // 4 bits
        // WinSwitchFlag    [2][2]int // 1 bit
        //
        // BlockType      [2][2]int    // 2 bits
        // MixedBlockFlag [2][2]int    // 1 bit
        // TableSelect    [2][2][3]int // 5 bits
        // SubblockGain   [2][2][3]int // 3 bits
        //
        // Region0Count [2][2]int // 4 bits
        // Region1Count [2][2]int // 3 bits
        //
        // Preflag           [2][2]int // 1 bit
        // ScalefacScale     [2][2]int // 1 bit
        // Count1TableSelect [2][2]int // 1 bit
        // Count1            [2][2]int // Not in file, calc by huffman decoder
        var sideinfo = {
        };
        util.init2dArray(sideinfo, 'Scfsi', 2, 4);
        util.init2dArray(sideinfo, 'Part2_3Length', 2, 2);
        util.init2dArray(sideinfo, 'BigValues', 2, 2);
        util.init2dArray(sideinfo, 'GlobalGain', 2, 2);
        util.init2dArray(sideinfo, 'ScalefacCompress', 2, 2);
        util.init2dArray(sideinfo, 'WinSwitchFlag', 2, 2);

        util.init2dArray(sideinfo, 'BlockType', 2, 2);
        util.init2dArray(sideinfo, 'MixedBlockFlag', 2, 2);
        util.init3dArray(sideinfo, 'TableSelect', 2, 2, 3);
        util.init3dArray(sideinfo, 'SubblockGain', 2, 2, 3);

        util.init2dArray(sideinfo, 'Region0Count', 2, 2);
        util.init2dArray(sideinfo, 'Region1Count', 2, 2);

        util.init2dArray(sideinfo, 'Preflag', 2, 2);
        util.init2dArray(sideinfo, 'ScalefacScale', 2, 2);
        util.init2dArray(sideinfo, 'Count1TableSelect', 2, 2);
        util.init2dArray(sideinfo, 'Count1', 2, 2);

        return sideinfo;
    },

    read: function (source, fheader, pos) {
        var nch = fheader.numberOfChannels();
        // Calculate header audio data size
        var framesize = fheader.frameSize();
        if (framesize > 2000) {
            return {
                v: null,
                err: "mp3: framesize = " + framesize
            }
        }
        // Sideinfo is 17 bytes for one channel and 32 bytes for two
        var sideinfo_size = 32;
        if (nch === 1) {
            sideinfo_size = 17;
        }
        // Main data size is the rest of the frame,including ancillary data
        var main_data_size = framesize - sideinfo_size - 4; // sync+header
        // CRC is 2 bytes
        if (fheader.protectionBit() === 0) {
            main_data_size -= 2;
        }
        // Read sideinfo from bitstream into buffer used by Bits()
        var result = source.readFull(sideinfo_size);
        if (result.err) {
            return {
                err: result.err
            }
        }
        var buf = result.buf;
        // var buf = new Uint8Array(source.buf, pos, sideinfo_size);
        if (buf.byteLength < sideinfo_size) {
            return {
                v: null,
                pos: pos,
                err: "mp3: couldn't read sideinfo " + sideinfo_size + " bytes"
            }
        }
        var s = Bits.createNew(new Uint8Array(buf.slice()).buffer);

        // Parse audio data
        // Pointer to where we should start reading main data
        var si = Sideinfo.createNew();
        si.MainDataBegin = s.Bits(9);
        // Get private bits. Not used for anything.
        if (fheader.mode() === consts.ModeSingleChannel) {
            si.PrivateBits = s.Bits(5);
        } else {
            si.PrivateBits = s.Bits(3);
        }
        // Get scale factor selection information
        for (var ch = 0; ch < nch; ch++) {
            for (var scfsi_band = 0; scfsi_band < 4; scfsi_band++) {
                si.Scfsi[ch][scfsi_band] = s.Bits(1);
            }
        }
        // Get the rest of the side information
        for (var gr = 0; gr < 2; gr++) {
            for (var ch = 0; ch < nch; ch++) {
                si.Part2_3Length[gr][ch] = s.Bits(12);
                console.log('si.Part2_3Length: ' + si.Part2_3Length);
                si.BigValues[gr][ch] = s.Bits(9);
                console.log('si.BigValues: ' + si.BigValues);
                si.GlobalGain[gr][ch] = s.Bits(8);
                console.log('si.GlobalGain: ' + si.GlobalGain);
                si.ScalefacCompress[gr][ch] = s.Bits(4);
                console.log('si.ScalefacCompress: ' + si.ScalefacCompress);
                si.WinSwitchFlag[gr][ch] = s.Bits(1);
                console.log('si.WinSwitchFlag: ' + si.WinSwitchFlag);
                if (si.WinSwitchFlag[gr][ch] === 1) {
                    si.BlockType[gr][ch] = s.Bits(2);
                    si.MixedBlockFlag[gr][ch] = s.Bits(1);
                    for (var region = 0; region < 2; region++) {
                        si.TableSelect[gr][ch][region] = s.Bits(5);
                    }
                    for (var window = 0; window < 3; window++) {
                        si.SubblockGain[gr][ch][window] = s.Bits(3);
                    }

                    // TODO: This is not listed on the spec. Is this correct??
                    if (si.BlockType[gr][ch] === 2 && si.MixedBlockFlag[gr][ch] === 0) {
                        si.Region0Count[gr][ch] = 8; // Implicit
                    } else {
                        si.Region0Count[gr][ch] = 7; // Implicit
                    }
                    // The standard is wrong on this!!!
                    // Implicit
                    si.Region1Count[gr][ch] = 20 - si.Region0Count[gr][ch];
                } else {
                    for (var region = 0; region < 3; region++) {
                        si.TableSelect[gr][ch][region] = s.Bits(5);
                    }
                    console.log('si.TableSelect: ' + si.TableSelect);
                    si.Region0Count[gr][ch] = s.Bits(4);
                    console.log('si.Region0Count: ' + si.Region0Count);
                    si.Region1Count[gr][ch] = s.Bits(3);
                    console.log('si.Region1Count: ' + si.Region1Count);
                    si.BlockType[gr][ch] = 0; // Implicit
                    console.log('si.BlockType: ' + si.BlockType);
                }
                si.Preflag[gr][ch] = s.Bits(1);
                console.log('si.Preflag: ' + si.Preflag);
                si.ScalefacScale[gr][ch] = s.Bits(1);
                console.log('si.ScalefacScale: ' + si.ScalefacScale);
                si.Count1TableSelect[gr][ch] = s.Bits(1);
                console.log('si.Count1TableSelect: ' + si.Count1TableSelect);
                console.log('--------------');
            }
        }
        return {
            v: si,
            err: null
        }
    }
};

module.exports = Sideinfo;
