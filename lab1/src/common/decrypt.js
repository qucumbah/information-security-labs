var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
define(["require", "exports", "./util"], function (require, exports, util) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    util = __importStar(util);
    function decrypt(message, matrix, useRotation = false) {
        const matrixLength = matrix.length * matrix[0].length;
        const decryptedChars = [];
        for (let chunkStart = 0; chunkStart < message.length; chunkStart += matrixLength) {
            const chunk = message.substring(chunkStart, chunkStart + matrixLength);
            let tempMatrix = matrix;
            readChars(chunk, tempMatrix, decryptedChars);
            tempMatrix = useRotation ? util.rotate(tempMatrix) : util.flipHorizontally(tempMatrix);
            readChars(chunk, tempMatrix, decryptedChars);
            tempMatrix = useRotation ? util.rotate(tempMatrix) : util.flipVertically(tempMatrix);
            readChars(chunk, tempMatrix, decryptedChars);
            tempMatrix = useRotation ? util.rotate(tempMatrix) : util.flipHorizontally(tempMatrix);
            readChars(chunk, tempMatrix, decryptedChars);
        }
        return decryptedChars.join('').replace(/\0/g, '');
    }
    function readChars(chunk, matrix, destination) {
        const rowCount = matrix.length;
        const colCount = matrix[0].length;
        for (let row = 0; row < rowCount; row += 1) {
            for (let col = 0; col < colCount; col += 1) {
                if (matrix[row][col]) {
                    continue;
                }
                const chunkChar = chunk[row * colCount + col];
                destination.push((chunkChar === undefined) ? '' : chunkChar);
            }
        }
    }
    exports.default = decrypt;
});
