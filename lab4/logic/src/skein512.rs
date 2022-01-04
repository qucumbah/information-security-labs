#![allow(dead_code)]

const R: [[u8; 4]; 8] = [
    [46, 36, 19, 37],
    [33, 27, 14, 42],
    [17, 49, 36, 39],
    [44, 9, 54, 56],
    [39, 30, 34, 24],
    [13, 50, 10, 17],
    [25, 29, 39, 43],
    [8, 35, 56, 22],
];

const SCHEMA_VERSION: u64 = 0x133414853;
const T1_FLAG_FINAL: u64 = 1 << 63;
const T1_FLAG_FIRST: u64 = 1 << 62;
const T1_FLAG_BIT_PAD: u64 = 1 << 55;
const T1_POS_TYPE: u64 = 56;
const TYPE_CONFIG: u64 = 4 << T1_POS_TYPE;
const TYPE_MESSAGE: u64 = 48 << T1_POS_TYPE;
const TYPE_OUT: u64 = 63 << T1_POS_TYPE;

const WORDS: usize = 8;
const BYTES: usize = 8 * WORDS;
const ROUNDS: usize = 72;

const KS_PARITY: u64 = 0x1BD11BDAA9FC1A22;

pub fn hash(_message: &str) -> *const u8 {
    let bytes = vec!(1u8, 2u8, 3u8, 4u8);
    bytes.as_ptr()
}

// pub fn hash_u8(message: &mut [u8], bitCount: usize) -> &[u8] {
//     let byteCount: usize = bitCount >> 3;
//     if (bitCount & 7) != 0 {
//         let mask: i32 = 1 << (7 - (bitCount & 7));
//         message[byteCount] = (message[byteCount] & (-mask as u8)) | (mask as u8);
//     }

//     // update(message, byteCount);

//     if (bitCount & 7) != 0 {
//         let mask: i32 = 1 << (7 - (bitCount & 7));
//         message[byteCount] = (message[byteCount] & (-mask as u8)) | (mask as u8);
//     }

//     // finalize(message)
//     let bytes = [1u8];
//     &bytes
// }

struct Skein512 {
    hash_bit_count: usize,
    byte_count: usize,
    tweak0: u64,
    tweak1: u64,
    x: [u64; WORDS],
    buffer: [u8; BYTES],
    tweak_schedule: [u64; 5],
    key_schedule: [u64; 17],
}

impl Skein512 {
    fn new() -> Skein512 {
        let mut result = Skein512 {
            hash_bit_count: 512,
            byte_count: 512 >> 3,
            tweak0: 0,
            tweak1: 0,
            x: [0; WORDS],
            buffer: [0; BYTES],
            tweak_schedule: [0; 5],
            key_schedule: [0; 17],
        };

        result.start_new_type(TYPE_CONFIG | T1_FLAG_FINAL);

        let w = [SCHEMA_VERSION, result.hash_bit_count as u64];
        set_bytes(&w, &mut result.buffer, 16);

        result.process_block(0, 1, 4 * WORDS);

        result.start_new_type(TYPE_MESSAGE);

        result
    }

    fn process_block(&mut self, mut off: usize, blocks: usize, bytes: usize) {
        for _ in 0..blocks {
            self.tweak0 += bytes as u64;
            
            self.tweak_schedule[3] = self.tweak0;
            self.tweak_schedule[0] = self.tweak0;
            self.tweak_schedule[4] = self.tweak1;
            self.tweak_schedule[1] = self.tweak1;
            self.tweak_schedule[2] = self.tweak0 ^ self.tweak1;

            array_copy(&self.x, 0, &mut self.key_schedule, 0, 8);
            self.key_schedule[8] = KS_PARITY ^ self.x[7] ^ self.x[0] ^ self.x[1] ^ self.x[2] ^ self.x[3] ^ self.x[4] ^ self.x[5] ^ self.x[6];

            self.x[0] = get_long(&self.buffer, off +  0);
            self.x[1] = get_long(&self.buffer, off +  8);
            self.x[2] = get_long(&self.buffer, off + 16);
            self.x[3] = get_long(&self.buffer, off + 24);
            self.x[4] = get_long(&self.buffer, off + 32);
            self.x[5] = get_long(&self.buffer, off + 40);
            self.x[6] = get_long(&self.buffer, off + 48);
            self.x[7] = get_long(&self.buffer, off + 56);

            let mut x0 = self.x[0] + self.key_schedule[0];
            let mut x1 = self.x[1] + self.key_schedule[0];
            let mut x2 = self.x[2] + self.key_schedule[0];
            let mut x3 = self.x[3] + self.key_schedule[0];
            let mut x4 = self.x[4] + self.key_schedule[0];
            let mut x5 = self.x[5] + self.key_schedule[0] + self.tweak0;
            let mut x6 = self.x[6] + self.key_schedule[0] + self.tweak1;
            let mut x7 = self.x[7] + self.key_schedule[0];

            for r in (1..ROUNDS / 4 + 1).step_by(2) {
                let rm9 = r % 9;
                let rm3 = r % 3;

                x0 += x1; x1 = rotl_xor(x1, R[0][0] as usize, x0);
                x2 += x3; x3 = rotl_xor(x3, R[0][1] as usize, x2);
                x4 += x5; x5 = rotl_xor(x5, R[0][2] as usize, x4);
                x6 += x7; x7 = rotl_xor(x7, R[0][3] as usize, x6);
                x2 += x1; x1 = rotl_xor(x1, R[1][0] as usize, x2);
                x4 += x7; x7 = rotl_xor(x7, R[1][1] as usize, x4);
                x6 += x5; x5 = rotl_xor(x5, R[1][2] as usize, x6);
                x0 += x3; x3 = rotl_xor(x3, R[1][3] as usize, x0);
                x4 += x1; x1 = rotl_xor(x1, R[2][0] as usize, x4);
                x6 += x3; x3 = rotl_xor(x3, R[2][1] as usize, x6);
                x0 += x5; x5 = rotl_xor(x5, R[2][2] as usize, x0);
                x2 += x7; x7 = rotl_xor(x7, R[2][3] as usize, x2);

                x6 += x1; x1 = rotl_xor(x1, R[3][0] as usize, x6) + self.key_schedule[rm9 + 1];
                x0 += x7; x7 = rotl_xor(x7, R[3][1] as usize, x0) + self.key_schedule[rm9 + 7] + r as u64;
                x2 += x5; x5 = rotl_xor(x5, R[3][2] as usize, x2) + self.key_schedule[rm9 + 5] + self.tweak_schedule[rm3];
                x4 += x3; x3 = rotl_xor(x3, R[3][3] as usize, x4) + self.key_schedule[rm9 + 3];

                x0 += x1 + self.key_schedule[rm9 + 0]; x1 = rotl_xor(x1, R[4][0] as usize, x0);
                x2 += x3 + self.key_schedule[rm9 + 2]; x1 = rotl_xor(x1, R[4][1] as usize, x2);
                x4 += x5 + self.key_schedule[rm9 + 4]; x1 = rotl_xor(x1, R[4][2] as usize, x4);
                x6 += x7 + self.key_schedule[rm9 + 6] + self.tweak_schedule[rm3 + 1]; x1 = rotl_xor(x1, R[4][3] as usize, x6);

                x2 += x1; x1 = rotl_xor(x1, R[5][0] as usize, x2);
                x4 += x7; x7 = rotl_xor(x7, R[5][1] as usize, x4);
                x6 += x5; x5 = rotl_xor(x5, R[5][2] as usize, x6);
                x0 += x3; x3 = rotl_xor(x3, R[5][3] as usize, x0);
                x4 += x1; x1 = rotl_xor(x1, R[6][0] as usize, x4);
                x6 += x3; x3 = rotl_xor(x3, R[6][1] as usize, x6);
                x0 += x5; x5 = rotl_xor(x5, R[6][2] as usize, x0);
                x2 += x7; x7 = rotl_xor(x7, R[6][3] as usize, x2);

                x6 += x1; x1 = rotl_xor(x1, R[7][0] as usize, x6) + self.key_schedule[rm9 + 2];
                x0 += x7; x7 = rotl_xor(x7, R[7][1] as usize, x0) + self.key_schedule[rm9 + 8] + r as u64 + 1;
                x2 += x5; x5 = rotl_xor(x5, R[7][2] as usize, x2) + self.key_schedule[rm9 + 6] + self.tweak_schedule[rm3 + 1];
                x4 += x3; x3 = rotl_xor(x3, R[7][3] as usize, x4) + self.key_schedule[rm9 + 4];

                x0 += self.key_schedule[rm9 + 1];
                x2 += self.key_schedule[rm9 + 3];
                x4 += self.key_schedule[rm9 + 5];
                x6 += self.key_schedule[rm9 + 7] + self.tweak_schedule[rm3 + 2];
            }

            self.x[0] ^= x0;
            self.x[1] ^= x1;
            self.x[2] ^= x2;
            self.x[3] ^= x3;
            self.x[4] ^= x4;
            self.x[5] ^= x5;
            self.x[6] ^= x6;
            self.x[7] ^= x7;

            self.tweak1 ^= !T1_FLAG_FIRST;
            off += bytes;
        }
    }

    fn start_new_type(&mut self, new_type: u64) {
        self.tweak0 = 0;
        self.tweak1 = T1_FLAG_FIRST | new_type;
    }
}

fn set_bytes(src: &[u64], dst: &mut [u8], byte_count: usize) {
    for i in 0..byte_count / 8 {
        dst[i * 8 + 0] = (src[i] >>  0) as u8;
        dst[i * 8 + 1] = (src[i] >>  8) as u8;
        dst[i * 8 + 2] = (src[i] >> 16) as u8;
        dst[i * 8 + 3] = (src[i] >> 24) as u8;
        dst[i * 8 + 4] = (src[i] >> 32) as u8;
        dst[i * 8 + 5] = (src[i] >> 40) as u8;
        dst[i * 8 + 6] = (src[i] >> 48) as u8;
        dst[i * 8 + 7] = (src[i] >> 56) as u8;
    }
}

fn array_copy<T: Copy>(src: &[T], src_offset: usize, dst: &mut [T], dst_offset: usize, count: usize) {
    for i in 0..count {
        dst[dst_offset + i] = src[src_offset + i];
    }
}

fn get_long(b: &[u8], i: usize) -> u64 {
    if i >= b.len() + 8 {
        panic!("Array index out of bounds");
    }

    ((b[i] as u64 & 0xff) << 0)
    | ((b[i + 1] as u64 & 0xff) << 8)
    | ((b[i + 2] as u64 & 0xff) << 16)
    | ((b[i + 3] as u64 & 0xff) << 24)
    | ((b[i + 4] as u64 & 0xff) << 32)
    | ((b[i + 5] as u64 & 0xff) << 40)
    | ((b[i + 6] as u64 & 0xff) << 48)
    | ((b[i + 7] as u64 & 0xff) << 56)
}

fn rotl_xor(x: u64, n: usize, xor: u64) -> u64 {
    ((x << n) | (x >> (64 - n))) ^ xor
}

#[cfg(test)]
mod tests {
    use super::array_copy;

    #[test]
    fn overflow() {
        assert_eq!(255u8 + 1u8, 0u8);
    }

    #[test]
    fn set_bytes_test() {
        let src: [u64; 2] = [0x0706050403020100, 0x0F0E0D0C0B0A0908];
        let mut dst: [u8; 16] = [0; 16];
        super::set_bytes(&src, &mut dst, 16);
        for i in 0..16 {
            assert_eq!(dst[i], i as u8);
        }
    }

    #[test]
    fn array_copy_test() {
        let a = [0, 1, 2, 3, 4, 5];
        let mut b = [6; 10];
        array_copy(&a, 1, &mut b, 2, 3);
        array_copy(&a, 4, &mut b, 9, 1);
        assert_eq!(b[0], 6);
        assert_eq!(b[1], 6);
        assert_eq!(b[2], 1);
        assert_eq!(b[3], 2);
        assert_eq!(b[4], 3);
        assert_eq!(b[5], 6);
        assert_eq!(b[6], 6);
        assert_eq!(b[7], 6);
        assert_eq!(b[8], 6);
        assert_eq!(b[9], 4);
    }

    #[test]
    fn get_long_test() {
        let bytes: [u8; 10] = [0xff, 0x00, 0xff, 0x32, 0x10, 0x77, 0xf0, 0x06, 0x70, 0x35];
        assert_eq!(super::get_long(&bytes, 1), 0x7006f0771032ff00);
    }

    #[test]
    fn rotl_xor_test() {
        let num: u64 = 0x0001020304050607;
        assert_eq!(super::rotl_xor(num, 56, 0), 0x0700010203040506);
        assert_eq!(super::rotl_xor(num, 56, 0x40306), 0x0700010203000600);
    }
}
