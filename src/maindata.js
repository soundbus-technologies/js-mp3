var util = require('./util');
var consts = require('./consts');
var huffman = require('./huffman');
var bits = require('./bits');

var scalefacSizes = [
    [0, 0], [0, 1], [0, 2], [0, 3], [3, 0], [1, 1], [1, 2], [1, 3],
    [2, 1], [2, 2], [2, 3], [3, 1], [3, 2], [3, 3], [4, 2], [4, 3]
];

var MainData = {
    createNew: function () {
        // A MainData is MPEG1 Layer 3 Main Data.
        var mainData = {
        };

        util.init3dArray(mainData, 'ScalefacL', 2, 2, 22);      // 0-4 bits
        util.init4dArray(mainData, 'ScalefacS', 2, 2, 13, 3);   // 0-4 bits
        util.init3dArray(mainData, 'Is', 2, 2, 576);            // Huffman coded freq. lines

        return mainData;
    },

    read: function (source, prev, fh, si) {
        var nch = fh.numberOfChannels();
        // Calculate header audio data size
        var framesize = fh.frameSize();
        if (framesize > 2000) {
            return {
                v: null,
                bits: null,
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
        if (fh.protectionBit() === 0) {
            main_data_size -= 2;
        }
        // Assemble main data buffer with data from this frame and the previous
        // two frames. main_data_begin indicates how many bytes from previous
        // frames that should be used. This buffer is later accessed by the
        // Bits function in the same way as the side info is.
        var result = read(source, prev, main_data_size, si.MainDataBegin); // read bits for maindata
        if (result.err) {
            return {
                v: null,
                bits: null,
                err: result.err
            }
        }

        var b = result.b;
        var md = MainData.createNew();
        for (var gr = 0; gr < 2; gr++) {
            for (var ch = 0; ch < nch; ch++) {
                var part_2_start = b.BitPos();
                // Number of bits in the bitstream for the bands
                var slen1 = scalefacSizes[si.ScalefacCompress[gr][ch]][0];
                var slen2 = scalefacSizes[si.ScalefacCompress[gr][ch]][1];
                if (si.WinSwitchFlag[gr][ch] === 1 && si.BlockType[gr][ch] === 2) {
                    if (si.MixedBlockFlag[gr][ch] !== 0) {
                        for (var sfb = 0; sfb < 8; sfb++) {
                            md.ScalefacL[gr][ch][sfb] = b.Bits(slen1)
                        }
                        for (var sfb = 3; sfb < 12; sfb++) {
                            //slen1 for band 3-5,slen2 for 6-11
                            var nbits = slen2;
                            if (sfb < 6) {
                                nbits = slen1;
                            }
                            for (var win = 0; win < 3; win++) {
                                md.ScalefacS[gr][ch][sfb][win] = b.Bits(nbits);
                            }
                        }
                    } else {
                        for (var sfb = 0; sfb < 12; sfb++) {
                            //slen1 for band 3-5,slen2 for 6-11
                            var nbits = slen2;
                            if (sfb < 6) {
                                nbits = slen1;
                            }
                            for (var win = 0; win < 3; win++) {
                                md.ScalefacS[gr][ch][sfb][win] = b.Bits(nbits);
                            }
                        }
                    }
                } else {
                    // Scale factor bands 0-5
                    if (si.Scfsi[ch][0] === 0 || gr === 0) {
                        for (var sfb = 0; sfb < 6; sfb++) {
                            md.ScalefacL[gr][ch][sfb] = b.Bits(slen1);
                        }
                    } else if (si.Scfsi[ch][0] === 1 && gr === 1) {
                        // Copy scalefactors from granule 0 to granule 1
                        // TODO: This is not listed on the spec.
                        for (var sfb = 0; sfb < 6; sfb++) {
                            md.ScalefacL[1][ch][sfb] = md.ScalefacL[0][ch][sfb];
                        }
                    }
                    // Scale factor bands 6-10
                    if (si.Scfsi[ch][1] === 0 || gr === 0) {
                        for (var sfb = 6; sfb < 11; sfb++) {
                            md.ScalefacL[gr][ch][sfb] = b.Bits(slen1);
                        }
                    } else if (si.Scfsi[ch][1] === 1 && gr === 1) {
                        // Copy scalefactors from granule 0 to granule 1
                        for (var sfb = 6; sfb < 11; sfb++) {
                            md.ScalefacL[1][ch][sfb] = md.ScalefacL[0][ch][sfb];
                        }
                    }
                    // Scale factor bands 11-15
                    if (si.Scfsi[ch][2] === 0 || gr === 0) {
                        for (var sfb = 11; sfb < 16; sfb++) {
                            md.ScalefacL[gr][ch][sfb] = b.Bits(slen2);
                        }
                    } else if (si.Scfsi[ch][2] === 1 && gr === 1) {
                        // Copy scalefactors from granule 0 to granule 1
                        for (var sfb = 11; sfb < 16; sfb++) {
                            md.ScalefacL[1][ch][sfb] = md.ScalefacL[0][ch][sfb];
                        }
                    }
                    // Scale factor bands 16-20
                    if (si.Scfsi[ch][3] === 0 || gr === 0) {
                        for (var sfb = 16; sfb < 21; sfb++) {
                            md.ScalefacL[gr][ch][sfb] = b.Bits(slen2);
                        }
                    } else if (si.Scfsi[ch][3] === 1 && gr === 1) {
                        // Copy scalefactors from granule 0 to granule 1
                        for (var sfb = 16; sfb < 21; sfb++) {
                            md.ScalefacL[1][ch][sfb] = md.ScalefacL[0][ch][sfb];
                        }
                    }
                }
                var err = readHuffman(b, fh, si, md, part_2_start, gr, ch);
                if (err) {
                    return {
                        v: null,
                        bits: null,
                        err: err
                    }
                }
            }
        }
        return {
            v: md,
            bits: b,
            err: null
        }
    }
};

var read = function (source, prev, size, offset) {
    if (size > 1500) {
        return {
            b: null,
            err: "mp3: size = " + size
        }
    }
    // Check that there's data available from previous frames if needed
    if (prev !== null && offset > prev.LenInBytes()) {
        // No, there is not, so we skip decoding this frame, but we have to
        // read the main_data bits from the bitstream in case they are needed
        // for decoding the next frame.
        var buf = new Uint8Array(source, 0, size);
        if (buf.byteLength < size) {
            return {
                b: null,
                err: "maindata.Read (1)"
            }
        }
        // TODO: Define a special error and enable to continue the next frame.
        return {
            m: bits.append(prev, buf),
            err: null
        };
    }
    // Copy data from previous frames
    var vec;
    if (prev !== null) {
        vec = prev.Tail(offset);
    }
    // Read the main_data from file
    var result = source.readFull(size);
    if (result.err) {
        return {
            err: result.err
        }
    }
    var buf = result.buf;
    // var buf = new Uint8Array(source, 0, size);
    if (buf.byteLength < size) {
        return {
            b: null,
            err: "maindata.Read (2)"
        }
    }
    return {
        b: bits.createNew(util.concatBuffers(vec, new Uint8Array(buf.slice()).buffer)),
        err: null
    }
};

var readHuffman = function (m, header, sideInfo, mainData, part_2_start, gr, ch) {
    // Check that there is any data to decode. If not, zero the array.
    if (sideInfo.Part2_3Length[gr][ch] === 0) {
        for (var i = 0; i < consts.SamplesPerGr; i++) {
            mainData.Is[gr][ch][i] = 0.0;
        }
        return null;
    }

    // Calculate bit_pos_end which is the index of the last bit for this part.
    var bit_pos_end = part_2_start + sideInfo.Part2_3Length[gr][ch] - 1;
    // Determine region boundaries
    var region_1_start = 0;
    var region_2_start = 0;
    if ((sideInfo.WinSwitchFlag[gr][ch] === 1) && (sideInfo.BlockType[gr][ch] === 2)) {
        region_1_start = 36;                  // sfb[9/3]*3=36
        region_2_start = consts.SamplesPerGr; // No Region2 for short block case.
    } else {
        var sfreq = header.samplingFrequency().value;
        var l = consts.SfBandIndicesSet[sfreq].L;
        var i = sideInfo.Region0Count[gr][ch] + 1;
        if (i < 0 || util.len(l) <= i) {
            // TODO: Better error messages (#3)
            return "mp3: readHuffman failed: invalid index i: " + i;
        }
        region_1_start = l[i];
        var j = sideInfo.Region0Count[gr][ch] + sideInfo.Region1Count[gr][ch] + 2;
        if (j < 0 || util.len(l) <= j) {
            // TODO: Better error messages (#3)
            return "mp3: readHuffman failed: invalid index j: " + j;
        }
        region_2_start = l[j];
    }
    // Read big_values using tables according to region_x_start
    for (var is_pos = 0; is_pos < sideInfo.BigValues[gr][ch]*2; is_pos++) {
        // #22
        if (is_pos >= util.len(mainData.Is[gr][ch])) {
            return "mp3: is_pos was too big: " + is_pos;
        }
        var table_num = 0;
        if (is_pos < region_1_start) {
            table_num = sideInfo.TableSelect[gr][ch][0];
        } else if (is_pos < region_2_start) {
            table_num = sideInfo.TableSelect[gr][ch][1];
        } else {
            table_num = sideInfo.TableSelect[gr][ch][2];
        }
        // Get next Huffman coded words
        // console.log('is_pos: ' + is_pos)
        // console.log('table_num: ' + table_num)
        var result = huffman.decode(m, table_num);
        // console.log('x: ' + result.x + ', y: ' + result.y);
        // console.log('------');
        if (result.err) {
            return err;
        }
        // In the big_values area there are two freq lines per Huffman word
        mainData.Is[gr][ch][is_pos] = result.x;
        is_pos++;
        mainData.Is[gr][ch][is_pos] = result.y;
    }
    // Read small values until is_pos = 576 or we run out of huffman data
    // TODO: Is this comment wrong?
    var table_num = sideInfo.Count1TableSelect[gr][ch] + 32;
    var is_pos = sideInfo.BigValues[gr][ch] * 2;
    for (;is_pos <= 572 && m.BitPos() <= bit_pos_end;) {
        // Get next Huffman coded words
        var result = huffman.decode(m, table_num);
        if (result.err) {
            return err;
        }
        mainData.Is[gr][ch][is_pos] = result.v;
        is_pos++;
        if (is_pos >= consts.SamplesPerGr) {
            break;
        }
        mainData.Is[gr][ch][is_pos] = result.w;
        is_pos++;
        if (is_pos >= consts.SamplesPerGr) {
            break;
        }
        mainData.Is[gr][ch][is_pos] = result.x;
        is_pos++;
        if (is_pos >= consts.SamplesPerGr) {
            break;
        }
        mainData.Is[gr][ch][is_pos] = result.y;
        is_pos++;
    }
    // Check that we didn't read past the end of this section
    if (m.BitPos() > (bit_pos_end + 1)) {
        // Remove last words read
        is_pos -= 4;
    }

    // Setup count1 which is the index of the first sample in the rzero reg.
    sideInfo.Count1[gr][ch] = is_pos;

    // Zero out the last part if necessary
    for (;is_pos < consts.SamplesPerGr;) {
        mainData.Is[gr][ch][is_pos] = 0.0;
        is_pos++;
    }
    // Set the bitpos to point to the next part to read
    m.SetPos(bit_pos_end + 1);
    return null;
};

module.exports = MainData;
