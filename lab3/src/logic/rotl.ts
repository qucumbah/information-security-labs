export default function rotl(num: number, amount: number): number {
  return ((num << amount) | (num >>> (32 - amount))) & 0xffffffff;
}
