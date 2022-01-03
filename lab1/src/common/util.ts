import Matrix from './Matrix';

export function readMatrix(matrixString: string): Matrix {
  const lines: string[] = matrixString
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.length !== 0);

  const rowCount: number = lines.length;
  const colCount: number = lines.reduce(
    (maxLength, curRow) => (curRow.length > maxLength) ? curRow.length : maxLength,
    0
  );

  const matrix: Matrix = createEmptyMatrix(rowCount, colCount);

  for (let row = 0; row < rowCount; row += 1) {
    for (let col = 0; col < colCount; col += 1) {
      matrix[row]![col] = lines[row]![col] === '#';
    }
  }

  return matrix;
}

export function createEmptyMatrix(rowCount: number, colCount: number): Matrix {
  return new Array(rowCount).fill(null).map(() => new Array(colCount).fill(true));
}

export function testMatrix(matrix: Matrix): boolean {
  if (matrix.length % 2 !== 0 || matrix[0]!.length % 2 !== 0) {
    return false;
  }

  const empty: Matrix = createEmptyMatrix(matrix.length, matrix[0]!.length);

  let tempMatrix: Matrix = matrix;
  if (!checkTaken(tempMatrix, empty)) return false;
  tempMatrix = flipHorizontally(tempMatrix);
  if (!checkTaken(tempMatrix, empty)) return false;
  tempMatrix = flipVertically(tempMatrix);
  if (!checkTaken(tempMatrix, empty)) return false;
  tempMatrix = flipHorizontally(tempMatrix);
  if (!checkTaken(tempMatrix, empty)) return false;

  console.log(empty);

  return true;
}

function checkTaken(matrix: Matrix, empty: Matrix): boolean {
  const rowCount: number = matrix.length;
  const colCount: number = matrix[0]!.length;

  for (let row = 0; row < rowCount; row += 1) {
    for (let col = 0; col < colCount; col += 1) {
      if (matrix[row]![col]) {
        continue;
      }

      if (empty[row]![col]) {
        empty[row]![col] = false;
        continue;
      }

      return false;
    }
  }

  return true;
}

export function flipVertically(matrix: Matrix): Matrix {
  const rowCount: number = matrix.length;
  const colCount: number = matrix[0]!.length;

  const newMatrix = createEmptyMatrix(rowCount, colCount);

  for (let row = 0; row < rowCount; row += 1) {
    for (let col = 0; col < colCount; col += 1) {
      newMatrix[row]![col] = matrix[rowCount - 1 - row]![col]!;
    }
  }

  return newMatrix;
}

export function flipHorizontally(matrix: Matrix): Matrix {
  const rowCount: number = matrix.length;
  const colCount: number = matrix[0]!.length;

  const newMatrix = createEmptyMatrix(rowCount, colCount);

  for (let row = 0; row < rowCount; row += 1) {
    for (let col = 0; col < colCount; col += 1) {
      newMatrix[row]![col] = matrix[row]![colCount - 1 - col]!;
    }
  }

  return newMatrix;
}

export function rotate(matrix: Matrix): Matrix {
  const rowCount: number = matrix.length;
  const colCount: number = matrix[0]!.length;

  const newMatrix = createEmptyMatrix(rowCount, colCount);

  for (let row = 0; row < rowCount; row += 1) {
    for (let col = 0; col < colCount; col += 1) {
      newMatrix[col]![colCount - 1 - row] = matrix[row]![col]!;
    }
  }

  return newMatrix;
}
