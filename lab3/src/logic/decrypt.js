var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "./blockDecrypt", "./generateSubKeys"], function (require, exports, blockDecrypt_1, generateSubKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    blockDecrypt_1 = __importDefault(blockDecrypt_1);
    generateSubKeys_1 = __importDefault(generateSubKeys_1);
    function decrypt(input, key) {
        const K = (0, generateSubKeys_1.default)(key);
        const paddedOutput = new Uint8Array(input.length);
        for (let i = 0; i < input.length; i += 16) {
            (0, blockDecrypt_1.default)(input, i, paddedOutput, i, K);
        }
        let paddingStart = input.length - 1;
        while (paddedOutput[paddingStart] === 0) {
            paddingStart -= 1;
        }
        return paddedOutput.slice(0, paddingStart);
    }
    exports.default = decrypt;
});
