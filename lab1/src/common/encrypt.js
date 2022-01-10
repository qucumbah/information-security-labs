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
    function encrypt(message, matrix, useRotation = false) {
        const matrixLength = matrix.length * matrix[0].length;
        const holeCount = matrix.reduce((totalHoles, row) => totalHoles + row.reduce((holesInRow, cell) => holesInRow + (cell ? 0 : 1), 0), 0);
        const encryptedChunks = [];
        for (let chunkStart = 0; chunkStart < message.length; chunkStart += matrixLength) {
            const chunk = message.substring(chunkStart, chunkStart + matrixLength);
            const encryptedChunkChars = new Array(matrixLength).fill('');
            let subchunk = chunk.substring(holeCount * 0, holeCount * 1);
            let tempMatrix = matrix;
            writeChars(subchunk, tempMatrix, encryptedChunkChars);
            subchunk = chunk.substring(holeCount * 1, holeCount * 2);
            tempMatrix = useRotation ? util.rotate(tempMatrix) : util.flipHorizontally(tempMatrix);
            writeChars(subchunk, tempMatrix, encryptedChunkChars);
            subchunk = chunk.substring(holeCount * 2, holeCount * 3);
            tempMatrix = useRotation ? util.rotate(tempMatrix) : util.flipVertically(tempMatrix);
            writeChars(subchunk, tempMatrix, encryptedChunkChars);
            subchunk = chunk.substring(holeCount * 3, holeCount * 4);
            tempMatrix = useRotation ? util.rotate(tempMatrix) : util.flipHorizontally(tempMatrix);
            writeChars(subchunk, tempMatrix, encryptedChunkChars);
            encryptedChunks.push(encryptedChunkChars.join(''));
        }
        return encryptedChunks.join('');
    }
    function writeChars(chunk, matrix, destination) {
        const rowCount = matrix.length;
        const colCount = matrix[0].length;
        let i = 0;
        for (let row = 0; row < rowCount; row += 1) {
            for (let col = 0; col < colCount; col += 1) {
                if (matrix[row][col]) {
                    continue;
                }
                const chunkChar = chunk[i];
                i += 1;
                destination[row * colCount + col] = (chunkChar === undefined) ? '\0' : chunkChar;
            }
        }
    }
    exports.default = encrypt;
});
