#![allow(dead_code)]

pub fn hash(m: &[u8], h: &mut [u8; 64]) {
    let mut c = [0u64; 9];
    let mut t = [32u64, 0xC4u64 << 56, 0];
    let mut b = [0u8; 64];
    let d = "ND3EAJ.;1QDGLXV)G>B8-1*R9=GK(6XC".as_bytes();

    b[0] = b'S';
    b[1] = b'H';
    b[2] = b'A';
    b[3] = b'3';
    b[4] = 1;
    b[5] = 0;
    b[6] = 0;
    b[7] = 0;
    b[8] = 0;
    b[9] = 2;
    
    block(&mut c, &mut t, &b, 0, d);

    t[0] = 0;
    t[1] = 0x70u64 << 56;

    while m.len() > 64 && t[0] < (m.len() - 64) as u64 {
        t[0] += 64;
        let o = (t[0] - 64) as usize;
        block(&mut c, &mut t, &m, o, d);
        t[1] = 0x30u64 << 56
    }

    b = [0u8; 64];
    array_copy(m, t[0] as usize, &mut b, 0, m.len() - t[0] as usize);

    t[0] = m.len() as u64;
    t[1] |= 0x80u64 << 56;
    block(&mut c, &mut t, &b, 0, d);

    t[0] = 8;
    t[1] = 0xffu64 << 56;
    block(&mut c, &mut t, &mut [0u8; 64], 0, d);

    for i in 0..64 {
        h[i] = (c[i / 8] >> (i & 7) * 8) as u8;
    }
}

fn block(c: &mut [u64], t: &mut [u64; 3], b: &[u8], o: usize, d: &[u8]) {
    let mut x = [0u64; 8];
    let mut k = [0u64; 8];

    c[8] = 0x1BD11BDAA9FC1A22u64;
    for i in 0..8 {
        for j in (0..8).rev() {
            k[i] = (k[i] << 8) + (b[o + i * 8 + j] & 0xff) as u64;
        }

        x[i] = k[i] + c[i];
        c[8] ^= c[i];
    }

    x[5] += t[0];
    x[6] += t[1];
    t[2] = t[0] ^ t[1];

    for r in 1..19 {
        let p = match r % 2 {
            0 => 16,
            1 => 0,
            _ => panic!("Invalid r%2"),
        };

        for i in 0..16 {
            let m = 2 * ((i + (1 + i * 2) * (i / 4)) & 3);
            let n = (1 + i * 2) & 7;
            let s = d[p + i] - 32;

            x[m] += x[n];
            x[n] = ((x[n] << s) | (x[n] >> (64 - s))) ^ x[m];
        }

        for i in 0..8 {
            x[i] += c[(r + i) % 9];
        }

        x[5] += t[r % 3];
        x[6] += t[(r + 1) % 3];
        x[7] += r as u64;
    }

    for i in 0..8 {
        c[i] = k[i] ^ x[i];
    }
}

fn array_copy<T: Copy>(src: &[T], src_offset: usize, dst: &mut [T], dst_offset: usize, count: usize) {
    for i in 0..count {
        dst[dst_offset + i] = src[src_offset + i];
    }
}

#[cfg(test)]
mod tests {
    use std::{fs::File, io::Read};

    use super::array_copy;

    #[test]
    fn overflow() {
        assert_eq!(255u8 + 1u8, 0u8);
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
    fn hash_tests() {
        hash_test(1);
        hash_test(2);
        hash_test(3);
    }

    fn hash_test(number: u8) {
        let message = &read_file_as_bytes(format!("./data/message{}.txt", number).as_str())[..];
        let expected_hash = &read_file_as_bytes(format!("./data/hash{}.txt", number).as_str())[..];

        let mut actual_hash = [0u8; 64];
        super::hash(message, &mut actual_hash);

        assert_eq!(actual_hash, expected_hash);
    }

    fn read_file_as_bytes(path: &str) -> Vec<u8> {
        let mut file = File::open(path).expect(format!("Failed to open message file {}", path).as_str());
        let mut buf = Vec::new();
        file.read_to_end(&mut buf).expect(format!("Failed to read message file {}", path).as_str());
        buf
    }
}
