import blockDecrypt from './blockDecrypt';
import generateSubKeys from './generateSubKeys';

export default function decrypt(input: Uint8Array, key: Uint8Array): Uint8Array {
  const K: Uint32Array = generateSubKeys(key);

  const paddedOutput = new Uint8Array(input.length);
  for (let i = 0; i < input.length; i += 16) {
    blockDecrypt(input, i, paddedOutput, i, K);
  }

  let paddingStart = input.length - 1;
  while (paddedOutput[paddingStart] === 0) {
    paddingStart -= 1;
  }

  return paddedOutput.slice(0, paddingStart);
}
