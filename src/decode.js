var Mp3 = {
    // Create new source object with specified ArrayBuffer
    newSource: function(buf) {
        var source = {
            buf: buf,
            pos: 0
        };

        source.skipTags = function () {
            // TODO implement it
        };

        return source;
    }
};

module.exports = Mp3;
