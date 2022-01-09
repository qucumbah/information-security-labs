pub fn hash(message: &[u8]) -> [u8; 20] {
    let mut hash = [0u8; 20];

    let mut h: [u32; 5] = [
        0x67452301,
        0xEFCDAB89,
        0x98BADCFE,
        0x10325476,
        0xC3D2E1F0,
    ];

    let padded_message: &[u8] = &pad(message)[..];
    for chunk_start in (0..padded_message.len()).step_by(64) {
        let mut w: Vec<u32> = Vec::new();
        for i in 0..16 {
            w.push(u32_from_bytes(padded_message, chunk_start + i * 4));
        }

        for i in 16..80 {
            w.push(lotr(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1));
        }

        let mut a: u32 = h[0];
        let mut b: u32 = h[1];
        let mut c: u32 = h[2];
        let mut d: u32 = h[3];
        let mut e: u32 = h[4];

        for i in 0..80 {
            let (f, k): (u32, u32) = if i < 20 {
                ((b & c) | (!b & d), 0x5A827999)
            } else if i < 40 {
                (b ^ c ^ d, 0x6ED9EBA1)
            } else if i < 60 {
                ((b & c) | (b & d) | (c & d), 0x8F1BBCDC)
            } else {
                (b ^ c ^ d, 0xCA62C1D6)
            };

            let temp: u32 = lotr(a, 5) + f + e + k + w[i];
            e = d;
            d = c;
            c = lotr(b, 30);
            b = a;
            a = temp;
        }

        h[0] += a;
        h[1] += b;
        h[2] += c;
        h[3] += d;
        h[4] += e;
    }

    for i in 0..5 {
        let h_bytes: Vec<u8> = u32_to_bytes(h[i]);
        for byte_number in 0..4 {
            hash[i * 4 + byte_number] = h_bytes[byte_number];
        }
    }

    hash
}

fn pad(message: &[u8]) -> Vec<u8> {
    let mut result: Vec<u8> = message.iter().map(|byte| *byte).collect();

    let desired_length: usize = match message.len() % 64 {
        57..=63 => message.len() / 64 * 64 + 128,
        _ => message.len() / 64 * 64 + 64,
    };

    result.push(0x80);

    for _ in result.len()..desired_length - 8 {
        result.push(0);
    }

    result.extend(u64_to_bytes((message.len() * 8) as u64));

    result
}

pub fn u64_to_bytes(src: u64) -> Vec<u8> {
    let mut result: Vec<u8> = Vec::new();

    for i in 0..8 {
        result.push((src >> ((7 - i) * 8)) as u8);
    }

    result
}

pub fn u32_to_bytes(src: u32) -> Vec<u8> {
    let mut result: Vec<u8> = Vec::new();

    for i in 0..4 {
        result.push((src >> ((3 - i) * 8)) as u8);
    }

    result
}

fn u32_from_bytes(bytes: &[u8], offset: usize) -> u32 {
    (bytes[offset + 3] as u32 & 0xff)
    | (bytes[offset + 2] as u32 & 0xff) << 8
    | (bytes[offset + 1] as u32 & 0xff) << 16
    | (bytes[offset + 0] as u32 & 0xff) << 24
}

fn lotr(num: u32, count: usize) -> u32 {
    num << count | num >> (32 - count)
}

#[cfg(test)]
mod tests {
    use std::{fs::File, io::Read};

    #[test]
    fn overflow() {
        assert_eq!(255u8 + 1u8, 0u8);
    }

    #[test]
    fn u64_to_bytes_test() {
        let src = 0x0706050403020100;
        let dst = super::u64_to_bytes(src);
        for i in 0..8 {
            assert_eq!(dst[i], (7 - i) as u8);
        }
    }

    #[test]
    fn u32_to_bytes_test() {
        let src = 0x03020100;
        let dst = super::u32_to_bytes(src);
        for i in 0..4 {
            assert_eq!(dst[i], (3 - i) as u8);
        }
    }

    #[test]
    fn u32_from_bytes_test() {
        let bytes: [u8; 10] = [0xff, 0x00, 0xff, 0x32, 0x10, 0x77, 0xf0, 0x06, 0x70, 0x35];
        assert_eq!(super::u32_from_bytes(&bytes, 1), 0x00ff3210);
    }

    #[test]
    fn lotr_test() {
        let num: u32 = 0x01020304;
        assert_eq!(super::lotr(num, 24), 0x04010203);
        assert_eq!(super::lotr(num, 28), 0x40102030);
        assert_eq!(super::lotr(num, 16), 0x03040102);
        assert_eq!(super::lotr(num, 32), num);
    }

    #[test]
    fn pad_tests() {
        let message = [1u8; 80];
        pad_test(&message, 128);

        let message = [1u8; 128];
        pad_test(&message, 192);

        let message = [1u8; 57];
        pad_test(&message, 128);

        let message = [1u8; 56];
        pad_test(&message, 64);
    }

    fn pad_test(message: &[u8], expected_length: usize) {
        let padded_message: Vec<u8> = super::pad(message);

        assert_eq!(padded_message.len(), expected_length);

        let length_bytes = super::u64_to_bytes(message.len() as u64);

        for i in 0..expected_length - 8 {
            let expected_element = if i < message.len() {
                message[i]
            } else if i <= expected_length - 8 {
                0
            } else {
                length_bytes[i - expected_length - 8 - 1]
            };

            assert_eq!(padded_message[i], expected_element);
        }
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

        let actual_hash = super::hash(message);

        assert_eq!(actual_hash, expected_hash);
    }

    fn read_file_as_bytes(path: &str) -> Vec<u8> {
        let mut file = File::open(path).expect(format!("Failed to open message file {}", path).as_str());
        let mut buf = Vec::new();
        file.read_to_end(&mut buf).expect(format!("Failed to read message file {}", path).as_str());
        buf
    }
}
