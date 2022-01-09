mod utils;
mod sha1;
mod dsa;

use wasm_bindgen::prelude::*;
use openssl::bn::BigNum;

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

pub fn generate_params() -> *const u8 {
    let (p, q): (BigNum, BigNum) = dsa::generate_p_q(1024, 160);
    let g: BigNum = dsa::generate_g(&p, &q);

    let (x, y) = dsa::generate_keys(&p, &q, &g);

    let p = p.to_vec();
    let q = q.to_vec();
    let g = g.to_vec();
    let x = x.to_vec();
    let y = y.to_vec();

    let mut result = Vec::new();
    result.extend(sha1::u64_to_bytes(p.len() as u64));
    result.extend(p.to_vec());
    result.extend(sha1::u64_to_bytes(q.len() as u64));
    result.extend(q.to_vec());
    result.extend(sha1::u64_to_bytes(g.len() as u64));
    result.extend(g.to_vec());
    result.extend(sha1::u64_to_bytes(x.len() as u64));
    result.extend(x.to_vec());
    result.extend(sha1::u64_to_bytes(y.len() as u64));
    result.extend(y.to_vec());

    result[..].as_ptr()
}
