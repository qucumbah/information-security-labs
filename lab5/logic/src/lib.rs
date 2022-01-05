mod utils;
mod sha1;
mod dsa;

use wasm_bindgen::prelude::*;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn initialize() {
    utils::set_panic_hook();
}

#[wasm_bindgen]
pub fn sha1_hash(message: &str) -> *const u8 {
    let hash = sha1::hash(message.as_bytes());
    hash.as_ptr()
}
