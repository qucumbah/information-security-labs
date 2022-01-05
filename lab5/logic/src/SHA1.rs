#![allow(dead_code)]

pub fn hash(message: &[u8], hash: &mut [u8; 20]) {
    let padded_message: &[u8] = &pad(message)[..];
}

fn pad(message: &[u8]) -> Vec<u8> {
    let mut result: Vec<u8> = message.iter().map(|byte| *byte).collect();
    
    let desired_length: usize = match message.len() % 64 {
        57..=63 => message.len() / 64 * 64 + 128,
        _ => message.len() / 64 * 64 + 64,
    };

    for i in result.len()..desired_length - 8 {
        result[i] = 0;
    }

    result.extend(to_bytes(message.len() as u64));

    result
}

fn array_copy<T: Copy>(src: &[T], src_offset: usize, dst: &mut [T], dst_offset: usize, count: usize) {
    for i in 0..count {
        dst[dst_offset + i] = src[src_offset + i];
    }
}

fn to_bytes(src: u64) -> Vec<u8> {
    let mut result: Vec<u8> = Vec::new();

    for i in 0..8 {
        result[i] = (src >> (i * 8)) as u8;
    }

    result
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

        let mut actual_hash = [0u8; 20];
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
