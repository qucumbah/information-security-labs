import Matrix from './Matrix';
import * as util from './util';

function encrypt(message: string, matrix: Matrix, useRotation = false): string {
  const matrixLength: number = matrix.length * matrix[0]!.length;
  const holeCount: number = matrix.reduce(
    (totalHoles, row) => totalHoles + row.reduce(
      (holesInRow, cell) => holesInRow + (cell ? 0 : 1),
      0
    ),
    0
  );

  const encryptedChunks: string[] = [];

  for (let chunkStart = 0; chunkStart < message.length; chunkStart += matrixLength) {
    const chunk: string = message.substring(chunkStart, chunkStart + matrixLength);
    const encryptedChunkChars: string[] = new Array(matrixLength).fill('');

    let subchunk: string = chunk.substring(holeCount * 0, holeCount * 1);
    let tempMatrix: Matrix = matrix;
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

function writeChars(chunk: string, matrix: Matrix, destination: string[]): void {
  const rowCount: number = matrix.length;
  const colCount: number = matrix[0]!.length;

  let i = 0;
  for (let row = 0; row < rowCount; row += 1) {
    for (let col = 0; col < colCount; col += 1) {
      if (matrix[row]![col]) {
        continue;
      }

      const chunkChar: string | undefined = chunk[i];
      i += 1;
      destination[row * colCount + col] = (chunkChar === undefined) ? '\0' : chunkChar;
    }
  }
}

export default encrypt;
