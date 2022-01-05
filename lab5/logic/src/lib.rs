mod utils;
mod SHA1;

use wasm_bindgen::prelude::*;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn initialize() {
    utils::set_panic_hook();
}

#[wasm_bindgen]
pub fn skein512_hash(message: &str) -> *const u8 {
    let mut hash = [0u8; 20];
    SHA1::hash(message.as_bytes(), &mut hash);
    hash.as_ptr()
}
