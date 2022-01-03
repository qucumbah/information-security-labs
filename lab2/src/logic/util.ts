import Matrix from './Matrix';

export function stringToUint8Array(messageString: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(messageString);
}

export function Uint8ArrayToString(message: Uint8Array): string {
  const decoder = new TextDecoder();
  return decoder.decode(message);
}

export function readMatrix(matrixString: string): Matrix | null {
  if (matrixString.length !== 8) {
    return null;
  }

  const matrix: Matrix = createEmptyMatrix();
  for (let i = 0; i < 8; i += 1) {
    const char: string = matrixString[i]!;

    const isValid: boolean = (char >= '0') && (char <= '7');
    if (!isValid) {
      return null;
    }

    const num = Number(char);
    if (matrix.includes(num)) {
      return null;
    }

    matrix[i] = num;
  }

  return matrix;
}

export function createEmptyMatrix(): Matrix {
  return [-1, -1, -1, -1, -1, -1, -1, -1];
}

export function transformMessage(message: Uint8Array, matrix: Matrix): Uint8Array {
  return message.map((byte: number) => transformByte(byte, matrix));
}

function transformByte(byte: number, matrix: Matrix): number {
  let result = 0;
  for (let offset = 0; offset < 8; offset += 1) {
    const isOn: boolean = (byte & (1 << offset)) !== 0;
    if (!isOn) {
      continue;
    }

    result |= 1 << matrix[offset]!;
  }

  return result;
}

export function crackMatrix(message: Uint8Array, prefix: Uint8Array): Matrix | null {
  const matrixOptions: boolean[][] = new Array(8).fill(null).map(() => new Array(8).fill(true));
  for (let i = 0; i < prefix.length; i += 1) {
    const prefixByte: number = prefix[i]!;
    const messageByte: number = message[i]!;

    for (let prefixBit = 0; prefixBit < 8; prefixBit += 1) {
      const isPrefixBitOn: boolean = (prefixByte & (1 << prefixBit)) !== 0;
      for (let messageBit = 0; messageBit < 8; messageBit += 1) {
        const isMessageBitOn: boolean = (messageByte & (1 << messageBit)) !== 0;
        if (isPrefixBitOn !== isMessageBitOn) {
          matrixOptions[messageBit]![prefixBit] = false;
        }
      }
    }
  }

  console.log(matrixOptions);

  const matrix: Matrix = createEmptyMatrix();
  for (let i = 0; i < 8; i += 1) {
    let validOption = -1;
    for (let option = 0; option < 8; option += 1) {
      if (matrixOptions[i]![option]) {
        if (validOption !== -1) {
          return null;
        }

        validOption = option;
      }
    }

    if (validOption === -1) {
      return null;
    }

    if (matrix.includes(validOption)) {
      return null;
    }

    matrix[i] = validOption;
  }

  return matrix;
}
