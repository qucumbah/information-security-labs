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

  const invalidMatrix: Matrix = ioUtil.readMatrixFromFile('./data/invalid.txt');

  assert(!util.testMatrix(invalidMatrix), 'Invalid rectangular matrix');

  const longMessage1 = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKL';
  assert(encrypt(longMessage1, largeMatrix) === format('iaembnjfocgkhpldyqu2r3zv4sw0x51tE6AI7JFBK8CGDLH9'), 'Encrypt large message');
  assert(decrypt(encrypt(longMessage1, largeMatrix), largeMatrix) === longMessage1, 'Decrypt large message');

  const longMessage2 = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOP';
  assert(encrypt(longMessage2, largeMatrix) === format('iaembnjfocgkhpldyqu2r3zv4sw0x51tE6AI7JFBK8CGDLH9#M##N####O#####P'), 'Encrypt large message out of bounds');
  assert(decrypt(encrypt(longMessage2, largeMatrix), largeMatrix) === longMessage2, 'Encrypt large message out of bounds');

  const beforeRotation: Matrix = [
    [true, false],
    [false, false],
  ];
  const afterRotation1: Matrix = util.rotate(beforeRotation);
  assert(afterRotation1[0]![1] === true, 'Rotation 1');
  const afterRotation2: Matrix = util.rotate(afterRotation1);
  assert(afterRotation2[1]![1] === true, 'Rotation 2');
  const afterRotation3: Matrix = util.rotate(afterRotation2);
  assert(afterRotation3[1]![0] === true, 'Rotation 3');
  const afterRotation4: Matrix = util.rotate(afterRotation3);
  assert(afterRotation4[0]![0] === true, 'Rotation 4');
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
