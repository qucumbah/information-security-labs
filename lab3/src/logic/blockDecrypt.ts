import E from './E';
import S from './S';

export default function blockDecrypt(
  input: Uint8Array,
  inputOffset: number,
  output: Uint8Array,
  outputOffset: number,
  K: Uint32Array,
): void {
  const D = new Uint32Array(4);
  D[0] = (input[inputOffset++] & 0xFF) |
         (input[inputOffset++] & 0xFF) << 8 |
         (input[inputOffset++] & 0xFF) << 16 |
         (input[inputOffset++] & 0xFF) << 24;

  D[1] = (input[inputOffset++] & 0xFF) |
         (input[inputOffset++] & 0xFF) << 8 |
         (input[inputOffset++] & 0xFF) << 16 |
         (input[inputOffset++] & 0xFF) << 24;

  D[2] = (input[inputOffset++] & 0xFF) |
         (input[inputOffset++] & 0xFF) << 8 |
         (input[inputOffset++] & 0xFF) << 16 |
         (input[inputOffset++] & 0xFF) << 24;

  D[3] = (input[inputOffset++] & 0xFF) |
         (input[inputOffset++] & 0xFF) << 8 |
         (input[inputOffset++] & 0xFF) << 16 |
         (input[inputOffset++] & 0xFF) << 24;

  D[0] += K[36];
  D[1] += K[37];
  D[2] += K[38];
  D[3] += K[39];

  for (let i = 7; i >= 0; i -= 1) {
    const temp: number = D[3];
    D[3] = D[2];
    D[2] = D[1];
    D[1] = D[0];
    D[0] = temp;

    D[0] = D[0] << 8 | D[0] >>> 24;
    D[3] ^= S[(D[0] >>> 8) & 0xFF];
    D[3] += S[256 + ((D[0] >>> 16) & 0xFF)];
    D[2] += S[(D[0] >>> 24) & 0xFF];
    D[1] ^= S[256 + (D[0] & 0xFF)];

    switch (i) {
      case 2:
      case 6:
        D[0] += D[3];
        break;
      case 3:
      case 7:
        D[0] += D[1];
        break;
    }
  }

  for (let i = 15; i >= 0; i -= 1) {
    const temp: number = D[3];
    D[3] = D[2];
    D[2] = D[1];
    D[1] = D[0];
    D[0] = temp;

    D[0] = D[0] << 19 | D[0] >>> 13;

    const ia: [number, number, number] = E(D[0], K[2 * i + 4], K[2 * i + 5]);
    D[2] -= ia[1];

    if (i < 8) {
      D[1] -= ia[0];
      D[3] ^= ia[2];
    } else {
      D[3] -= ia[0];
      D[1] ^= ia[2];
    }
  }

  for (let i = 7; i >= 0; i -= 1) {
    const temp: number = D[3];
    D[3] = D[2];
    D[2] = D[1];
    D[1] = D[0];
    D[0] = temp;

    switch (i) {
      case 0:
      case 4:
        D[0] -= D[3];
        break;
      case 1:
      case 5:
        D[0] -= D[1];
        break;
    }

    D[0] = D[0] << 24 | D[0] >>> 8;
    D[3] ^= S[256 + ((D[0] >>> 24) & 0xFF)];
    D[2] -= S[(D[0] >>> 16) & 0xFF];
    D[1] -= S[256 + ((D[0] >>> 8) & 0xFF)];
    D[1] ^= S[D[0] & 0xFF];
  }

  D[0] -= K[0];
  D[1] -= K[1];
  D[2] -= K[2];
  D[3] -= K[3];

  output[outputOffset++] = (D[0]       );
  output[outputOffset++] = (D[0] >>>  8);
  output[outputOffset++] = (D[0] >>> 16);
  output[outputOffset++] = (D[0] >>> 24);

  output[outputOffset++] = (D[1]       );
  output[outputOffset++] = (D[1] >>>  8);
  output[outputOffset++] = (D[1] >>> 16);
  output[outputOffset++] = (D[1] >>> 24);

  output[outputOffset++] = (D[2]       );
  output[outputOffset++] = (D[2] >>>  8);
  output[outputOffset++] = (D[2] >>> 16);
  output[outputOffset++] = (D[2] >>> 24);

  output[outputOffset++] = (D[3]       );
  output[outputOffset++] = (D[3] >>>  8);
  output[outputOffset++] = (D[3] >>> 16);
  output[outputOffset++] = (D[3] >>> 24);
}
