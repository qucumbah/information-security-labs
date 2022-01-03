import * as fs from 'fs';
import * as readline from 'readline';

type Matrice = boolean[][];

function readMatriceFromFile(filePath: string): Matrice {
  const fileContent: string = fs.readFileSync(filePath).toString();
  const lines: string[] = fileContent
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.length !== 0);

  const rowCount: number = lines.length;
  const colCount: number = lines.reduce(
    (maxLength, curRow) => (curRow.length > maxLength) ? curRow.length : maxLength,
    0
  );

  const matrice: Matrice = createEmptyMatrice(rowCount, colCount);

  for (let row = 0; row < rowCount; row += 1) {
    for (let col = 0; col < colCount; col += 1) {
      matrice[row]![col] = lines[row]![col] === '#';
    }
  }

  return matrice;
}

// @ts-ignore
function decrypt(message: string, matrice: Matrice): string {
  const matriceLength: number = matrice.length * matrice[0]!.length;

  const decryptedChars: string[] = [];

  for (let chunkStart = 0; chunkStart < message.length; chunkStart += matriceLength) {
    const chunk: string = message.substring(chunkStart, chunkStart + matriceLength);

    let tempMatrice: Matrice = matrice;
    readChars(chunk, tempMatrice, decryptedChars);
    tempMatrice = flipHorizontally(tempMatrice);
    readChars(chunk, tempMatrice, decryptedChars);
    tempMatrice = flipVertically(tempMatrice);
    readChars(chunk, tempMatrice, decryptedChars);
    tempMatrice = flipHorizontally(tempMatrice);
    readChars(chunk, tempMatrice, decryptedChars);
  }

  return decryptedChars.join('').replace(/\0/g, '');
}

// @ts-ignore
function encrypt(message: string, matrice: Matrice): string {
  const matriceLength: number = matrice.length * matrice[0]!.length;
  const holeCount: number = matrice.reduce(
    (totalHoles, row) => totalHoles + row.reduce(
      (holesInRow, cell) => holesInRow + (cell ? 0 : 1),
      0
    ),
    0
  );

  const encryptedChunks: string[] = [];

  for (let chunkStart = 0; chunkStart < message.length; chunkStart += matriceLength) {
    const chunk: string = message.substring(chunkStart, chunkStart + matriceLength);
    const encryptedChunkChars: string[] = new Array(matriceLength).fill('');

    let subchunk: string = chunk.substring(holeCount * 0, holeCount * 1);
    let tempMatrice: Matrice = matrice;
    writeChars(subchunk, tempMatrice, encryptedChunkChars);
    subchunk = chunk.substring(holeCount * 1, holeCount * 2);
    tempMatrice = flipHorizontally(tempMatrice);
    writeChars(subchunk, tempMatrice, encryptedChunkChars);
    subchunk = chunk.substring(holeCount * 2, holeCount * 3);
    tempMatrice = flipVertically(tempMatrice);
    writeChars(subchunk, tempMatrice, encryptedChunkChars);
    subchunk = chunk.substring(holeCount * 3, holeCount * 4);
    tempMatrice = flipHorizontally(tempMatrice);
    writeChars(subchunk, tempMatrice, encryptedChunkChars);

    encryptedChunks.push(encryptedChunkChars.join(''));
  }

  return encryptedChunks.join('');
}

function readChars(chunk: string, matrice: Matrice, destination: string[]): void {
  const rowCount: number = matrice.length;
  const colCount: number = matrice[0]!.length;

  for (let row = 0; row < rowCount; row += 1) {
    for (let col = 0; col < colCount; col += 1) {
      if (matrice[row]![col]) {
        continue;
      }

      const chunkChar: string | undefined = chunk[row * colCount + col];
      destination.push((chunkChar === undefined) ? '' : chunkChar);
    }
  }
}

function writeChars(chunk: string, matrice: Matrice, destination: string[]): void {
  const rowCount: number = matrice.length;
  const colCount: number = matrice[0]!.length;

  let i = 0;
  for (let row = 0; row < rowCount; row += 1) {
    for (let col = 0; col < colCount; col += 1) {
      if (matrice[row]![col]) {
        continue;
      }

      const chunkChar: string | undefined = chunk[i];
      i += 1;
      destination[row * colCount + col] = (chunkChar === undefined) ? '\0' : chunkChar;
    }
  }
}

function flipVertically(matrice: Matrice): Matrice {
  const rowCount: number = matrice.length;
  const colCount: number = matrice[0]!.length;

  const newMatrice = createEmptyMatrice(rowCount, colCount);

  for (let row = 0; row < rowCount; row += 1) {
    for (let col = 0; col < colCount; col += 1) {
      newMatrice[row]![col] = matrice[rowCount - 1 - row]![col]!;
    }
  }

  return newMatrice;
}

function flipHorizontally(matrice: Matrice): Matrice {
  const rowCount: number = matrice.length;
  const colCount: number = matrice[0]!.length;

  const newMatrice = createEmptyMatrice(rowCount, colCount);

  for (let row = 0; row < rowCount; row += 1) {
    for (let col = 0; col < colCount; col += 1) {
      newMatrice[row]![col] = matrice[row]![colCount - 1 - col]!;
    }
  }

  return newMatrice;
}

function createEmptyMatrice(rowCount: number, colCount: number): Matrice {
  return new Array(rowCount).fill(null).map(() => new Array(colCount).fill(true));
}

// @ts-ignore
function testMatrice(matrice: Matrice): boolean {
  const empty: Matrice = createEmptyMatrice(matrice.length, matrice[0]!.length);

  let tempMatrice: Matrice = matrice;
  if (!checkTaken(tempMatrice, empty)) return false;
  tempMatrice = flipHorizontally(tempMatrice);
  if (!checkTaken(tempMatrice, empty)) return false;
  tempMatrice = flipVertically(tempMatrice);
  if (!checkTaken(tempMatrice, empty)) return false;
  tempMatrice = flipHorizontally(tempMatrice);
  if (!checkTaken(tempMatrice, empty)) return false;

  return true;
}

function checkTaken(matrice: Matrice, empty: Matrice): boolean {
  const rowCount: number = matrice.length;
  const colCount: number = matrice[0]!.length;

  for (let row = 0; row < rowCount; row += 1) {
    for (let col = 0; col < colCount; col += 1) {
      if (matrice[row]![col]) {
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

// @ts-ignore
function test(): void {
  const smallMatrice: Matrice = readMatriceFromFile('./data/small.txt');
  console.log(decrypt('abcde', smallMatrice));
  console.log(encrypt('abcde', smallMatrice));

  const largeMatrice: Matrice = readMatriceFromFile('./data/square.txt');
  const message = 'abcdefghijklmnop';
  console.log(decrypt(encrypt(message, largeMatrice), largeMatrice));

  console.log(encrypt('abcdefghijklmnopq', largeMatrice));
  console.log(decrypt(encrypt('abcdefghijklmnopq', largeMatrice), largeMatrice));

  console.log(testMatrice(largeMatrice));

  const rectangularMatrice: Matrice = readMatriceFromFile('./data/rectangular.txt');

  console.log(testMatrice(rectangularMatrice));

  const longMessage1 = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKL';
  console.log(encrypt(longMessage1, largeMatrice));
  console.log(decrypt(encrypt(longMessage1, largeMatrice), largeMatrice));

  const longMessage2 = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOP';
  console.log(encrypt(longMessage2, largeMatrice));
  console.log(decrypt(encrypt(longMessage2, largeMatrice), largeMatrice));
}
// test();

// @ts-ignore
async function main() {
  const modeString: string = (await prompt('Encrypt (e) or decrypt (d): ')).toLowerCase();
  if (modeString !== 'e' && modeString !== 'd') {
    console.log('Invalid mode: ', modeString);
    process.exit(1);
  }

  const encryptMode: boolean = modeString === 'e';

  const input: string = await prompt('Input: ');
  const inputContent: string = fs.readFileSync(input).toString();

  const output: string = await prompt('Output: ');

  const rectangularMatrice: Matrice = readMatriceFromFile('./data/rectangular.txt');
  const handler: (message: string, matrice: Matrice) => string = encryptMode ? encrypt : decrypt;
  fs.writeFileSync(output, handler(inputContent, rectangularMatrice));
}
main();

function prompt(message: string): Promise<string> {
  const promptSession = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    promptSession.question(message, (answer) => {
      promptSession.close();
      resolve(answer);
    });
  });
}
