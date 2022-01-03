import Matrix from '../common/Matrix';
import * as fs from 'fs';
import * as readline from 'readline';
import * as ioUtil from './ioUtil';
import encrypt from '../common/encrypt';
import decrypt from '../common/decrypt';

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

  const rectangularMatrix: Matrix = ioUtil.readMatrixFromFile('./data/rectangular.txt');
  const handler: (message: string, matrix: Matrix) => string = encryptMode ? encrypt : decrypt;
  fs.writeFileSync(output, handler(inputContent, rectangularMatrix));
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
