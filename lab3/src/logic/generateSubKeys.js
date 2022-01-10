var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "./maskFrom", "./rotl", "./S"], function (require, exports, maskFrom_1, rotl_1, S_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    maskFrom_1 = __importDefault(maskFrom_1);
    rotl_1 = __importDefault(rotl_1);
    S_1 = __importDefault(S_1);
    function generateSubKeys(key) {
        const T = new Uint32Array(15);
        let i = 0;
        for (; i < key.length; i += 1) {
            T[Math.floor(i / 4)] |= (key[i] & 0xFF) << (i * 8);
        }
        T[Math.floor(i / 4)] = Math.floor(i / 4);
        const K = new Uint32Array(40);
        for (let j = 0; j < 4; j += 1) {
            // Linear transformation
            for (let i = 0; i < 15; i += 1) {
                T[i] ^= (0, rotl_1.default)(T[(i + 8) % 15] ^ T[(i + 13) % 15], 3) ^ (4 * i + j);
            }
            // Stirring
            for (let round = 0; round < 4; round += 1) {
                for (let i = 0; i < 15; i += 1) {
                    T[i] = (0, rotl_1.default)(T[i] + S_1.default[T[(i + 14) % 15] & 0x1ff], 9);
                }
            }
            for (let i = 0; i < 10; i += 1) {
                K[10 * j + i] = T[(4 * i) % 15];
            }
        }
        const B = new Uint32Array([0xa4a8d57b, 0x5b5d193b, 0xc8a8309b, 0x73f9a978]);
        for (let i = 5; i <= 35; i += 2) {
            const j = K[i] & 0x3;
            const w = K[i] | 0x3;
            const m = (0, maskFrom_1.default)(w);
            const r = K[i - 1] & 0x1f;
            const p = (0, rotl_1.default)(B[j], r);
            K[i] = w ^ (p & m);
        }
        return K;
    }
    exports.default = generateSubKeys;
});
