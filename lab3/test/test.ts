import * as fs from 'fs';

import blockDecrypt from '../src/logic/blockDecrypt';
import blockEncrypt from '../src/logic/blockEncrypt';
import E from '../src/logic/E';
import encrypt from '../src/logic/encrypt';
import generateSubKeys from '../src/logic/generateSubKeys';
import maskFrom from '../src/logic/maskFrom';
import rotl from '../src/logic/rotl';

function test(): void {
  assertEquals(rotl(0xa4a8d57b, 9), 1370158921, 'rotl');
  assertEquals(rotl(0x3423832a, 5), -2073008826, 'rotl');
  assertEquals(rotl(0xffffffff, 2), -1, 'rotl');
  assertEquals(rotl(0xbacd3598, 3), -697717563, 'rotl');
  assertEquals(rotl(0x1, 1), 2, 'rotl');

  assertEquals(maskFrom(876543), 2145390588, 'maskFrom');
  assertEquals(maskFrom(3232566), 2139095040, 'maskFrom');
  assertEquals(maskFrom(2147482624), 1073740284, 'maskFrom');
  assertEquals(maskFrom(2147482625), 1073739776, 'maskFrom');
  assertEquals(maskFrom(4123566), 2139095040, 'maskFrom');

  const expectedSubkeys: number[] = [
    821420482,
    198584074,
    2944056906,
    703528370,
    1077994532,
    3955000615,
    1204253516,
    3736500923,
    2276703882,
    1080436411,
    4244873311,
    3115239275,
    314697540,
    2553578703,
    3671785227,
    2949853943,
    1975745412,
    3876151911,
    3802865789,
    2056057275,
    1233511326,
    1181574767,
    2293081780,
    2093880023,
    2268343886,
    3502180039,
    694556670,
    225767043,
    3383244144,
    4044414239,
    1044239188,
    2713534635,
    1513016169,
    1475178251,
    2983787265,
    1912741559,
    1658940775,
    402832766,
    575982260,
    2905481126
  ];

  const subKeys: Uint32Array = generateSubKeys(new Uint8Array([112, -31, 10, -65]));
  for (let i = 0; i < 40; i += 1) {
    assertEquals(subKeys[i], expectedSubkeys[i], 'subkeys');
  }

  function testE(actual: [number, number, number], expected: [number, number, number]): void {
    for (let i = 0; i < 3; i += 1) {
      assertEquals(actual[i], expected[i], 'E');
    }
  }
  testE(E(2147483647, 15, 2), [-485956883, 1073741831, -8389633]);
  testE(E(325789, 4329875, 2436825), [2144440013, -2062024669, -1971322375]);
  testE(E(582765, 337487, 13764623), [-911639670, 1884676096, 2040544616]);
  testE(E(-325356, 25726, -257825), [-1853662477, -76705025, -1254324964]);

  const expectedDecryptedBlock: number[] = [
    247,
    144,
    46,
    251,
    227,
    213,
    134,
    71,
    151,
    131,
    25,
    228,
    102,
    110,
    119,
    204
  ];

  const block = new Uint8Array([-88, -35, -21, 23, 110, 17, 4, 40, 59, -16, -22, 31, -123, -109, -40, 22]);
  const decryptedBlock = new Uint8Array(16);
  blockDecrypt(block, 0, decryptedBlock, 0, subKeys);

  for (let i = 0; i < 16; i += 1) {
    assertEquals(decryptedBlock[i], expectedDecryptedBlock[i], 'block decrypt');
  }

  const newlyEncryptedBlock = new Uint8Array(16);
  blockEncrypt(decryptedBlock, 0, newlyEncryptedBlock, 0, subKeys);

  for (let i = 0; i < 16; i += 1) {
    assertEquals(newlyEncryptedBlock[i], block[i], 'block encrypt');
  }

  const data: Uint8Array = fs.readFileSync('test/data.txt');
  const key: Uint8Array = fs.readFileSync('test/key');
  const expectedEncryptedData: Uint8Array = fs.readFileSync('test/data.enc');

  const encryptedData: Uint8Array = encrypt(data, key);
  for (let i = 0; i < expectedEncryptedData.length; i += 1) {
    assertEquals(expectedEncryptedData[i], encryptedData[i], 'encrypt');
  }
}
test();

// @ts-ignore
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
  console.log('Ok:', message);
}

function assertEquals<T>(a: T, b: T, message: string): void {
  if (a !== b) {
    console.log(a, '!=', b);
    throw new Error(message);
  }
  console.log('Ok:', message);
}

// @ts-ignore
function format(message: string): string {
  return message.replace(/#/g, '\0');
}
