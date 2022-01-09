mod utils;
mod sha1;
mod dsa;

use wasm_bindgen::prelude::*;
use num_bigint_dig::BigUint;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern {
    fn jslog(s: &str);
}

#[wasm_bindgen]
pub fn initialize() {
    utils::set_panic_hook();
}

#[wasm_bindgen]
pub fn sha1_hash(message: &str) -> *const u8 {
    let hash = sha1::hash(message.as_bytes());
    hash.as_ptr()
}

#[wasm_bindgen]
pub fn generate_params() -> *const u8 {
    let (p, q): (BigUint, BigUint) = dsa::generate_p_q(1024, 160);
    let g: BigUint = dsa::generate_g(&p, &q);

    let (x, y) = dsa::generate_keys(&p, &q, &g);

    jslog(format!("{} {} {} {} {}", p, q, g, x, y).as_str());

    let p = p.to_bytes_be();
    let q = q.to_bytes_be();
    let g = g.to_bytes_be();
    let x = x.to_bytes_be();
    let y = y.to_bytes_be();

    let mut encoded_params = Vec::new();
    encoded_params.extend(sha1::u32_to_bytes(p.len() as u32));
    encoded_params.extend(p.to_vec());
    encoded_params.extend(sha1::u32_to_bytes(q.len() as u32));
    encoded_params.extend(q.to_vec());
    encoded_params.extend(sha1::u32_to_bytes(g.len() as u32));
    encoded_params.extend(g.to_vec());
    encoded_params.extend(sha1::u32_to_bytes(x.len() as u32));
    encoded_params.extend(x.to_vec());
    encoded_params.extend(sha1::u32_to_bytes(y.len() as u32));
    encoded_params.extend(y.to_vec());

    let mut result = Vec::new();
    result.extend(sha1::u32_to_bytes(encoded_params.len() as u32));
    result.extend(encoded_params);

    result[..].as_ptr()
}
