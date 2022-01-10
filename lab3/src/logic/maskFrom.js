define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function maskFrom(x) {
        let m = (~x ^ (x >>> 1)) & 0x7fffffff;
        m &= (m >>> 1) & (m >>> 2);
        m &= (m >>> 3) & (m >>> 6);
        m <<= 1;
        m |= (m << 1);
        m |= (m << 2);
        m |= (m << 4);
        return m & 0xfffffffc;
    }
    exports.default = maskFrom;
});
