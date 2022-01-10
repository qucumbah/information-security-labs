define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function rotl(num, amount) {
        return ((num << amount) | (num >>> (32 - amount))) & 0xffffffff;
    }
    exports.default = rotl;
});
