var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "./blockEncrypt", "./generateSubKeys"], function (require, exports, blockEncrypt_1, generateSubKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    blockEncrypt_1 = __importDefault(blockEncrypt_1);
    generateSubKeys_1 = __importDefault(generateSubKeys_1);
    function encrypt(input, key) {
        const K = (0, generateSubKeys_1.default)(key);
        const paddedLength = Math.floor(input.length / 16) * 16 + 16;
        const paddedInput = new Uint8Array(paddedLength);
        const output = new Uint8Array(paddedLength);
        for (let i = 0; i < paddedLength; i += 1) {
            if (i < input.length) {
                paddedInput[i] = input[i];
            }
            else {
                paddedInput[i] = (i === input.length) ? 0x80 : 0;
            }
            if (i % 16 === 15) {
                (0, blockEncrypt_1.default)(paddedInput, i - 15, output, i - 15, K);
            }
        }
        return output;
    }
    exports.default = encrypt;
});
