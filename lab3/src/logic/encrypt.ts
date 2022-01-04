import blockEncrypt from './blockEncrypt';
import generateSubKeys from './generateSubKeys';

export default function encrypt(input: Uint8Array, key: Uint8Array): Uint8Array {
  const K: Uint32Array = generateSubKeys(key);

  const paddedLength: number = Math.floor(input.length / 16) * 16 + 16;
  const paddedInput: Uint8Array = new Uint8Array(paddedLength);
  const output: Uint8Array = new Uint8Array(paddedLength);

  for (let i = 0; i < paddedLength; i += 1) {
    if (i < input.length) {
      paddedInput[i] = input[i];
    } else {
      paddedInput[i] = (i === input.length) ? 0x80 : 0;
    }

    if (i % 16 === 15) {
      blockEncrypt(paddedInput, i - 15, output, i - 15, K);
    }
  }

  return output;
}
