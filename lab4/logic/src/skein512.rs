pub fn hash(_message: &str) -> *const u8 {
    let bytes = vec!(1u8, 2u8, 3u8, 4u8);
    bytes.as_ptr()
}

#[cfg(test)]
mod tests {
    #[test]
    fn overflow() {
        assert_eq!(255u8 + 1u8, 0u8);
    }
}
