function init2dArray(root, prop, first, second) {
    root[prop] = [];
    for (var i = 0; i < first; i++) {
        root[prop].push([]);
    }

    for(var i = 0; i < root[prop].length; i++) {
        for (var j = 0; j < second; j++) {
            root[prop][i].push(0);
        }
    }
}

function init3dArray(root, prop, first, second, third) {
    root[prop] = [];
    for (var i = 0; i < first; i++) {
        root[prop].push([]);
    }

    for(var i = 0; i < root[prop].length; i++) {
        for (var j = 0; j < second; j++) {
            root[prop][i].push([])
        }

        for (var x = 0; x < root[prop][i].length; x++) {
            for (var y = 0; y < third; y++) {
                root[prop][i][x].push(0);
            }
        }
    }
}

function init3dFloat32Array(root, prop, first, second, third) {
    root[prop] = [];
    for (var i = 0; i < first; i++) {
        root[prop].push([]);
    }

    for(var i = 0; i < root[prop].length; i++) {
        for (var j = 0; j < second; j++) {
            var a = new Uint32Array(third);
            a.fill(0);
            root[prop][i].push(a);
        }
    }
}

function init4dArray(root, prop, first, second, third, fourth) {
    root[prop] = [];
    for (var i = 0; i < first; i++) {
        root[prop].push([]);
    }

    for(var i = 0; i < root[prop].length; i++) {
        for (var j = 0; j < second; j++) {
            root[prop][i].push([])
        }

        for (var x = 0; x < root[prop][i].length; x++) {
            for (var y = 0; y < third; y++) {
                var a = [];
                for (var z = 0; z < fourth; z++) {
                    a.push(0);
                }
                root[prop][i][x].push(a);
            }
        }
    }
}

function concatTypedArrays(a, b) { // a, b TypedArray of same type
    var c = new (a.constructor)(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
}

function concatBuffers(a, b) {
    return concatTypedArrays(
        new Uint8Array((!!a ? a.buffer : new ArrayBuffer(0)) || a),
        new Uint8Array((!!b ? b.buffer : new ArrayBuffer(0)) || b)
    ).buffer;
}

function concatBytes(ui8a, byte) {
    var b = new Uint8Array(1);
    b[0] = byte;
    return concatTypedArrays(ui8a, b);
}

function len(v) {
    if (typeof(v) === 'object') {
        return v.length;
    }
    return 0;
}

module.exports = {
    init2dArray: init2dArray,
    init3dArray: init3dArray,
    init3dFloat32Array: init3dFloat32Array,
    init4dArray: init4dArray,
    concatTypedArrays: concatTypedArrays,
    concatBuffers: concatBuffers,
    concatBytes: concatBytes,
    len: len,

    string: {
        bin: function (v) {
            return parseInt(v);
        }
    },

    number: {
        bin: function (v) {
            var sign = (v < 0 ? "-" : "");
            var result = Math.abs(v).toString(2);
            while(result.length < 32) {
                result = "0" + result;
            }
            return sign + result;
        },
        toUint32: function (v) {
            return v >>> 0;
        },
        toInt32: function (v) {
            return v >> 0;
        },
        toFixed: function(num, s) {
            var times = Math.pow(10, s)
            var des = num * times + 0.5
            des = parseInt(des, 10) / times
            return des
        }
    }
};
