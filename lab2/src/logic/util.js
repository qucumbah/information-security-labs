define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.crackMatrix = exports.transformMessage = exports.createEmptyMatrix = exports.readMatrix = exports.Uint8ArrayToString = exports.stringToUint8Array = void 0;
    function stringToUint8Array(messageString) {
        const encoder = new TextEncoder();
        return encoder.encode(messageString);
    }
    exports.stringToUint8Array = stringToUint8Array;
    function Uint8ArrayToString(message) {
        const decoder = new TextDecoder();
        return decoder.decode(message);
    }
    exports.Uint8ArrayToString = Uint8ArrayToString;
    function readMatrix(matrixString) {
        if (matrixString.length !== 8) {
            return null;
        }
        const matrix = createEmptyMatrix();
        for (let i = 0; i < 8; i += 1) {
            const char = matrixString[i];
            const isValid = (char >= '0') && (char <= '7');
            if (!isValid) {
                return null;
            }
            const num = Number(char);
            if (matrix.includes(num)) {
                return null;
            }
            matrix[i] = num;
        }
        return matrix;
    }
    exports.readMatrix = readMatrix;
    function createEmptyMatrix() {
        return [-1, -1, -1, -1, -1, -1, -1, -1];
    }
    exports.createEmptyMatrix = createEmptyMatrix;
    function transformMessage(message, matrix) {
        return message.map((byte) => transformByte(byte, matrix));
    }
    exports.transformMessage = transformMessage;
    function transformByte(byte, matrix) {
        let result = 0;
        for (let offset = 0; offset < 8; offset += 1) {
            const isOn = (byte & (1 << offset)) !== 0;
            if (!isOn) {
                continue;
            }
            result |= 1 << matrix[offset];
        }
        return result;
    }
    function crackMatrix(message, prefix) {
        const matrixOptions = new Array(8).fill(null).map(() => new Array(8).fill(true));
        for (let i = 0; i < prefix.length; i += 1) {
            const prefixByte = prefix[i];
            const messageByte = message[i];
            for (let prefixBit = 0; prefixBit < 8; prefixBit += 1) {
                const isPrefixBitOn = (prefixByte & (1 << prefixBit)) !== 0;
                for (let messageBit = 0; messageBit < 8; messageBit += 1) {
                    const isMessageBitOn = (messageByte & (1 << messageBit)) !== 0;
                    if (isPrefixBitOn !== isMessageBitOn) {
                        matrixOptions[messageBit][prefixBit] = false;
                    }
                }
            }
        }
        console.log(matrixOptions);
        const matrix = createEmptyMatrix();
        for (let i = 0; i < 8; i += 1) {
            let validOption = -1;
            for (let option = 0; option < 8; option += 1) {
                if (matrixOptions[i][option]) {
                    if (validOption !== -1) {
                        return null;
                    }
                    validOption = option;
                }
            }
            if (validOption === -1) {
                return null;
            }
            if (matrix.includes(validOption)) {
                return null;
            }
            matrix[i] = validOption;
        }
        return matrix;
    }
    exports.crackMatrix = crackMatrix;
});
