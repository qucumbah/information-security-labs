var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "./S"], function (require, exports, S_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    S_1 = __importDefault(S_1);
    function E(input, key1, key2) {
        let M = (input + key1) & 0xffffffff;
        let R = Number((BigInt(input << 13 | input >>> 19) * BigInt(key2)) & BigInt(0xffffffff));
        const i = M & 0x1ff;
        let L = S_1.default[i];
        R = (R << 5 | R >>> 27) & 0xffffffff;
        let r = R & 0x1f;
        M = (M << r | M >>> (32 - r)) & 0xffffffff;
        L ^= R;
        R = (R << 5 | R >>> 27) & 0xffffffff;
        L ^= R;
        r = R & 0x1f;
        L = (L << r | L >>> (32 - r)) & 0xffffffff;
        return [L, M, R];
    }
    exports.default = E;
});
