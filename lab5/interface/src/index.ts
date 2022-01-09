// @ts-nocheck
import loadLogic, { initialize, InitOutput, sha1_hash, generate_params } from '../../logic/pkg/logic.js';

async function main() {
  const initOutput: InitOutput = await loadLogic();
  initialize();

  const messageInput = document.querySelector('#message') as HTMLInputElement;
  const messageFileInput = document.querySelector('#messageFile') as HTMLInputElement;

  messageFileInput.addEventListener('change', () => {
    if (messageFileInput.files === null || messageFileInput.files.length === 0) {
      return;
    }

    const file: File = messageFileInput.files[0]!;
    const reader = new FileReader();
    reader.readAsText(file);
    reader.addEventListener('load', () => {
      messageInput.value = reader.result as string;
      messageInput.dispatchEvent(new Event('input'));
    });
  });

  const pInput = document.querySelector('#pInput') as HTMLInputElement;
  const qInput = document.querySelector('#qInput') as HTMLInputElement;
  const gInput = document.querySelector('#gInput') as HTMLInputElement;
  const xInput = document.querySelector('#xInput') as HTMLInputElement;
  const yInput = document.querySelector('#yInput') as HTMLInputElement;

  const generateParametersButton = document.querySelector('#generateParametersButton') as HTMLInputElement;

  generateParametersButton.addEventListener('click', () => {
    // First 4 bytes are encoded parameters length
    const encodedParamsLengthPtr: number = generate_params();
    const encodedParamsLength: number = readU32(new Uint8Array(initOutput.memory.buffer, encodedParamsLengthPtr, 4), 0);

    // Encoded parameters format:
    // p byte length: u32
    // bytes of p
    // q byte length: u32
    // bytes of q
    // g byte length: u32
    // bytes of g
    // x byte length: u32
    // bytes of x
    // y byte length: u32
    // bytes of y
    const encodedParamsPtr: number = encodedParamsLengthPtr + 4;
    const encodedParams = new Uint8Array(initOutput.memory.buffer, encodedParamsPtr, encodedParamsLength);

    let offset = 0;
    const pLength: number = readU32(encodedParams, offset); offset += 4;
    const p: BigInt = bytesToBigInt(encodedParams, offset, pLength); offset += pLength;
    pInput.value = p;

    const qLength: number = readU32(encodedParams, offset); offset += 4;
    const q: BigInt = bytesToBigInt(encodedParams, offset, qLength); offset += qLength;
    qInput.value = q;

    const gLength: number = readU32(encodedParams, offset); offset += 4;
    const g: BigInt = bytesToBigInt(encodedParams, offset, gLength); offset += gLength;
    gInput.value = g;

    const xLength: number = readU32(encodedParams, offset); offset += 4;
    const x: BigInt = bytesToBigInt(encodedParams, offset, xLength); offset += xLength;
    xInput.value = x;

    const yLength: number = readU32(encodedParams, offset); offset += 4;
    const y: BigInt = bytesToBigInt(encodedParams, offset, yLength);
    yInput.value = y;

    console.log(pLength, p);
    console.log(qLength, q);
    console.log(gLength, g);
    console.log(xLength, x);
    console.log(yLength, y);
    console.log(encodedParamsLength, offset);
  });

  const rInput = document.querySelector('#rInput') as HTMLInputElement;
  const sInput = document.querySelector('#sInput') as HTMLInputElement;

  const generateSignatureButton = document.querySelector('#generateSignatureButton') as HTMLInputElement;

  const signatureValidElement = document.querySelector('#signatureValid') as HTMLElement;
  const signatureInvalidElement = document.querySelector('#signatureInvalid') as HTMLElement;

  const checkSignatureButton = document.querySelector('#checkSignatureButton') as HTMLInputElement;
}

function readU32(bytes: Uint8Array, offset: number): number {
  return (
      (bytes[offset + 0] << 24)
    + (bytes[offset + 1] << 16)
    + (bytes[offset + 2] <<  8)
    + (bytes[offset + 3] <<  0)
  );
}

function bytesToBigInt(bytes: Uint8Array, offset: number, length: number): BigInt {
  let result: BigInt = 0n;
  for (let i = 0; i < length; i += 1) {
    result <<= 8n;
    result += BigInt(bytes[offset + i]);
  }
  return result;
}

function bytesToHexString(bytes: Uint8Array, offset: number, length: number): string {
  return bytes.slice(offset, offset + length).map(byteToHex).join('');
}

function byteToHex(byte: number) {
  return ((byte < 16) ? '0' : '') + byte.toString(16);
}

main();
