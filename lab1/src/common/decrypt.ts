import Matrix from './Matrix';
import * as util from './util';

function decrypt(message: string, matrix: Matrix, useRotation = false): string {
  const matrixLength: number = matrix.length * matrix[0]!.length;

  const decryptedChars: string[] = [];

  for (let chunkStart = 0; chunkStart < message.length; chunkStart += matrixLength) {
    const chunk: string = message.substring(chunkStart, chunkStart + matrixLength);

    let tempMatrix: Matrix = matrix;
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

function readChars(chunk: string, matrix: Matrix, destination: string[]): void {
  const rowCount: number = matrix.length;
  const colCount: number = matrix[0]!.length;

  for (let row = 0; row < rowCount; row += 1) {
    for (let col = 0; col < colCount; col += 1) {
      if (matrix[row]![col]) {
        continue;
      }

      const chunkChar: string | undefined = chunk[row * colCount + col];
      destination.push((chunkChar === undefined) ? '' : chunkChar);
    }
  }
}

export default decrypt;
