import S from './S';

export default function E(input: number, key1: number, key2: number): [number, number, number] {
  let M: number = (input + key1) & 0xffffffff;
  let R: number = (input << 13 | input >>> 19) * key2 & 0xffffffff;
  const i: number = M & 0x1ff;
  let L: number = S[i];
  R = (R << 5 | R >>> 27) & 0xffffffff;
  let r: number = R & 0x1f;
  M = (M << r | M >>> (32 - r)) & 0xffffffff;
  L ^= R;
  R = (R << 5 | R >>> 27) & 0xffffffff;
  L ^= R;
  r = R & 0x1f;
  L = (L << r | L >>> (32 - r)) & 0xffffffff;
  return [L, M, R];
}
