var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "./E", "./S"], function (require, exports, E_1, S_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    E_1 = __importDefault(E_1);
    S_1 = __importDefault(S_1);
    function blockEncrypt(input, inputOffset, output, outputOffset, K) {
        const D = new Uint32Array(4);
        D[0] = (input[inputOffset++] & 0xFF) |
            (input[inputOffset++] & 0xFF) << 8 |
            (input[inputOffset++] & 0xFF) << 16 |
            (input[inputOffset++] & 0xFF) << 24;
        D[1] = (input[inputOffset++] & 0xFF) |
            (input[inputOffset++] & 0xFF) << 8 |
            (input[inputOffset++] & 0xFF) << 16 |
            (input[inputOffset++] & 0xFF) << 24;
        D[2] = (input[inputOffset++] & 0xFF) |
            (input[inputOffset++] & 0xFF) << 8 |
            (input[inputOffset++] & 0xFF) << 16 |
            (input[inputOffset++] & 0xFF) << 24;
        D[3] = (input[inputOffset++] & 0xFF) |
            (input[inputOffset++] & 0xFF) << 8 |
            (input[inputOffset++] & 0xFF) << 16 |
            (input[inputOffset++] & 0xFF) << 24;
        D[0] += K[0];
        D[1] += K[1];
        D[2] += K[2];
        D[3] += K[3];
        for (let i = 0; i < 8; i += 1) {
            D[1] ^= S_1.default[D[0] & 0xFF];
            D[1] += S_1.default[256 + ((D[0] >>> 8) & 0xFF)];
            D[2] += S_1.default[(D[0] >>> 16) & 0xFF];
            D[3] ^= S_1.default[256 + ((D[0] >>> 24) & 0xFF)];
            D[0] = D[0] << 8 | D[0] >>> 24;
            switch (i) {
                case 0:
                case 4:
                    D[0] += D[3];
                    break;
                case 1:
                case 5:
                    D[0] += D[1];
                    break;
            }
            const temp = D[0];
            D[0] = D[1];
            D[1] = D[2];
            D[2] = D[3];
            D[3] = temp;
        }
        for (let i = 0; i < 16; i += 1) {
            const ia = (0, E_1.default)(D[0], K[2 * i + 4], K[2 * i + 5]);
            D[0] = D[0] << 13 | D[0] >>> 19;
            D[2] += ia[1];
            if (i < 8) {
                D[1] += ia[0];
                D[3] ^= ia[2];
            }
            else {
                D[3] += ia[0];
                D[1] ^= ia[2];
            }
            const temp = D[0];
            D[0] = D[1];
            D[1] = D[2];
            D[2] = D[3];
            D[3] = temp;
        }
        for (let i = 0; i < 8; i += 1) {
            switch (i) {
                case 2:
                case 6:
                    D[0] -= D[3];
                    break;
                case 3:
                case 7:
                    D[0] -= D[1];
                    break;
            }
            D[1] ^= S_1.default[256 + (D[0] & 0xFF)];
            D[2] -= S_1.default[(D[0] >>> 24) & 0xFF];
            D[3] -= S_1.default[256 + ((D[0] >>> 16) & 0xFF)];
            D[3] ^= S_1.default[(D[0] >>> 8) & 0xFF];
            D[0] = D[0] << 24 | D[0] >>> 8;
            const temp = D[0];
            D[0] = D[1];
            D[1] = D[2];
            D[2] = D[3];
            D[3] = temp;
        }
        D[0] -= K[36];
        D[1] -= K[37];
        D[2] -= K[38];
        D[3] -= K[39];
        output[outputOffset++] = (D[0]);
        output[outputOffset++] = (D[0] >>> 8);
        output[outputOffset++] = (D[0] >>> 16);
        output[outputOffset++] = (D[0] >>> 24);
        output[outputOffset++] = (D[1]);
        output[outputOffset++] = (D[1] >>> 8);
        output[outputOffset++] = (D[1] >>> 16);
        output[outputOffset++] = (D[1] >>> 24);
        output[outputOffset++] = (D[2]);
        output[outputOffset++] = (D[2] >>> 8);
        output[outputOffset++] = (D[2] >>> 16);
        output[outputOffset++] = (D[2] >>> 24);
        output[outputOffset++] = (D[3]);
        output[outputOffset++] = (D[3] >>> 8);
        output[outputOffset++] = (D[3] >>> 16);
        output[outputOffset++] = (D[3] >>> 24);
    }
    exports.default = blockEncrypt;
});
