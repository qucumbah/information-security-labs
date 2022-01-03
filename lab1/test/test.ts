import Matrix from '../src/common/Matrix';
import * as ioUtil from '../src/cli/ioUtil';
import * as util from '../src/common/util';
import decrypt from '../src/common/decrypt';
import encrypt from '../src/common/encrypt';

function test(): void {
  const smallMatrix: Matrix = ioUtil.readMatrixFromFile('./data/small.txt');
  assert(decrypt('abcde', smallMatrix) === 'bacde', 'Decrypt correctly with a small matrix');
  assert(encrypt('abcde', smallMatrix) === format('bacd#e##'), 'Encrypt correctly with a small matrix');

  const longMessageForSmallMatrix = 'qwertyuiopasdfghjklzxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNM';
  assert(decrypt(encrypt(longMessageForSmallMatrix, smallMatrix), smallMatrix) === longMessageForSmallMatrix, 'Decrypt message back');

  const largeMatrix: Matrix = ioUtil.readMatrixFromFile('./data/square.txt');
  const message = 'abcdefghijklmnop';
  assert(decrypt(encrypt(message, largeMatrix), largeMatrix) === message, 'Decrypt message back with large square matrix');

  const message2 = 'abcdefghijklmnopq';
  assert(encrypt(message2, largeMatrix) === format('iaembnjfocgkhpld#q##############'), 'Encrypt out of bounds');
  assert(decrypt(encrypt(message2, largeMatrix), largeMatrix) === message2, 'Decrypt message back out of bounds');

  assert(util.testMatrix(largeMatrix), 'Valid large square matrix');

  const rectangularMatrix: Matrix = ioUtil.readMatrixFromFile('./data/rectangular.txt');

  assert(util.testMatrix(rectangularMatrix), 'Valid rectangular matrix');

  const longMessage1 = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKL';
  assert(encrypt(longMessage1, largeMatrix) === format('iaembnjfocgkhpldyqu2r3zv4sw0x51tE6AI7JFBK8CGDLH9'), 'Encrypt large message');
  assert(decrypt(encrypt(longMessage1, largeMatrix), largeMatrix) === longMessage1, 'Decrypt large message');

  const longMessage2 = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOP';
  assert(encrypt(longMessage2, largeMatrix) === format('iaembnjfocgkhpldyqu2r3zv4sw0x51tE6AI7JFBK8CGDLH9#M##N####O#####P'), 'Encrypt large message out of bounds');
  assert(decrypt(encrypt(longMessage2, largeMatrix), largeMatrix) === longMessage2, 'Encrypt large message out of bounds');
}
test();

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
  console.log('Ok:', message);
}

function format(message: string): string {
  return message.replace(/#/g, '\0');
}
