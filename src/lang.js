var sizeof = require('object-sizeof');

function toUint(value) {
    if (value > 2147483647 ) { // 2147483647 is max int in golang
        return 0;
    }

    var size = sizeof(value);
    var ab = new ArrayBuffer(size);
    var dv = new DataView(ab, 0);
    dv.setInt32(0, value);
    return dv.getUint32(0);
}

module.exports = {
    toUint: toUint
};
