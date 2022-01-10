define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.rotate = exports.flipHorizontally = exports.flipVertically = exports.testMatrix = exports.createEmptyMatrix = exports.readMatrix = void 0;
    function readMatrix(matrixString) {
        const lines = matrixString
            .split('\n')
            .map((line) => line.trimEnd())
            .filter((line) => line.length !== 0);
        const rowCount = lines.length;
        const colCount = lines.reduce((maxLength, curRow) => (curRow.length > maxLength) ? curRow.length : maxLength, 0);
        const matrix = createEmptyMatrix(rowCount, colCount);
        for (let row = 0; row < rowCount; row += 1) {
            for (let col = 0; col < colCount; col += 1) {
                matrix[row][col] = lines[row][col] === '#';
            }
        }
        return matrix;
    }
    exports.readMatrix = readMatrix;
    function createEmptyMatrix(rowCount, colCount) {
        return new Array(rowCount).fill(null).map(() => new Array(colCount).fill(true));
    }
    exports.createEmptyMatrix = createEmptyMatrix;
    function testMatrix(matrix) {
        if (matrix.length % 2 !== 0 || matrix[0].length % 2 !== 0) {
            return false;
        }
        const empty = createEmptyMatrix(matrix.length, matrix[0].length);
        let tempMatrix = matrix;
        if (!checkTaken(tempMatrix, empty))
            return false;
        tempMatrix = flipHorizontally(tempMatrix);
        if (!checkTaken(tempMatrix, empty))
            return false;
        tempMatrix = flipVertically(tempMatrix);
        if (!checkTaken(tempMatrix, empty))
            return false;
        tempMatrix = flipHorizontally(tempMatrix);
        if (!checkTaken(tempMatrix, empty))
            return false;
        console.log(empty);
        return true;
    }
    exports.testMatrix = testMatrix;
    function checkTaken(matrix, empty) {
        const rowCount = matrix.length;
        const colCount = matrix[0].length;
        for (let row = 0; row < rowCount; row += 1) {
            for (let col = 0; col < colCount; col += 1) {
                if (matrix[row][col]) {
                    continue;
                }
                if (empty[row][col]) {
                    empty[row][col] = false;
                    continue;
                }
                return false;
            }
        }
        return true;
    }
    function flipVertically(matrix) {
        const rowCount = matrix.length;
        const colCount = matrix[0].length;
        const newMatrix = createEmptyMatrix(rowCount, colCount);
        for (let row = 0; row < rowCount; row += 1) {
            for (let col = 0; col < colCount; col += 1) {
                newMatrix[row][col] = matrix[rowCount - 1 - row][col];
            }
        }
        return newMatrix;
    }
    exports.flipVertically = flipVertically;
    function flipHorizontally(matrix) {
        const rowCount = matrix.length;
        const colCount = matrix[0].length;
        const newMatrix = createEmptyMatrix(rowCount, colCount);
        for (let row = 0; row < rowCount; row += 1) {
            for (let col = 0; col < colCount; col += 1) {
                newMatrix[row][col] = matrix[row][colCount - 1 - col];
            }
        }
        return newMatrix;
    }
    exports.flipHorizontally = flipHorizontally;
    function rotate(matrix) {
        const rowCount = matrix.length;
        const colCount = matrix[0].length;
        const newMatrix = createEmptyMatrix(rowCount, colCount);
        for (let row = 0; row < rowCount; row += 1) {
            for (let col = 0; col < colCount; col += 1) {
                newMatrix[col][colCount - 1 - row] = matrix[row][col];
            }
        }
        return newMatrix;
    }
    exports.rotate = rotate;
});
