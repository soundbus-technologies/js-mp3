var imdctWinData = [new Float32Array(36), new Float32Array(36), new Float32Array(36), new Float32Array(36)];

var cosN12 = [];
for (var i = 0; i < 6; i++) {
    cosN12.push(new Float32Array(12));
}

var cosN36 = [];
for (var i = 0; i < 18; i++) {
    cosN36.push(new Float32Array(36));
}

var init = function () {
    for (var i = 0; i < 36; i++) {
        imdctWinData[0][i] = Math.sin(Math.PI / 36 * (i + 0.5));
    }
    for (var i = 0; i < 18; i++) {
        imdctWinData[1][i] = Math.sin(Math.PI / 36 * (i + 0.5));
    }
    for (var i = 18; i < 24; i++) {
        imdctWinData[1][i] = 1.0;
    }
    for (var i = 24; i < 30; i++) {
        imdctWinData[1][i] = Math.sin(Math.PI / 12 * (i + 0.5 - 18.0));
    }
    for (var i = 30; i < 36; i++) {
        imdctWinData[1][i] = 0.0;
    }
    for (var i = 0; i < 12; i++) {
        imdctWinData[2][i] = Math.sin(Math.PI / 12 * (i + 0.5));
    }
    for (var i = 12; i < 36; i++) {
        imdctWinData[2][i] = 0.0;
    }
    for (var i = 0; i < 6; i++) {
        imdctWinData[3][i] = 0.0;
    }
    for (var i = 6; i < 12; i++) {
        imdctWinData[3][i] = Math.sin(Math.PI / 12 * (i + 0.5 - 6.0));
    }
    for (var i = 12; i < 18; i++) {
        imdctWinData[3][i] = 1.0;
    }
    for (var i = 18; i < 36; i++) {
        imdctWinData[3][i] = Math.sin(Math.PI / 36 * (i + 0.5));
    }

    const cosN12_N = 12
    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 12; j++) {
            cosN12[i][j] = Math.cos(Math.PI / (2 * cosN12_N) * (2*j + 1 + cosN12_N/2) * (2*i + 1));
        }
    }

    const cosN36_N = 36;
    for (var i = 0; i < 18; i++) {
        for (var j = 0; j < 36; j++) {
            cosN36[i][j] = Math.cos(Math.PI / (2 * cosN36_N) * (2*j + 1 + cosN36_N/2) * (2*i + 1));
        }
    }
};

init();

var Imdct = {
    Win: function (inData, blockType) {
        var out = new Float32Array(36);
        if (blockType === 2) {
            var iwd = imdctWinData[blockType];
            const N = 12;
            for (var i = 0; i < 3; i++) {
                for (var p = 0; p < N; p++) {
                    var sum = 0.0;
                    for (var m = 0; m < N/2; m++) {
                        sum += inData[i+3*m] * cosN12[m][p];
                    }
                    out[6*i+p+6] += sum * iwd[p];
                }
            }
            return out;
        }
        const N = 36;
        var iwd = imdctWinData[blockType];
        for (var p = 0; p < N; p++) {
            var sum = 0.0;
            for (var m = 0; m < N/2; m++) {
                sum += inData[m] * cosN36[m][p];
            }
            out[p] = sum * iwd[p];
        }
        return out;
    }
};

module.exports = Imdct;
