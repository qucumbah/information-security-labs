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
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn console_log(s: &str);
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

    console_log(format!("{} {} {} {} {}", p, q, g, x, y).as_str());

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

#[wasm_bindgen]
pub fn sign(message: &str, p: &str, q: &str, g: &str, x: &str) -> *const u8 {
    let message: &[u8] = message.as_bytes();

    let p = &BigUint::parse_bytes(p.as_bytes(), 10).unwrap();
    let q = &BigUint::parse_bytes(q.as_bytes(), 10).unwrap();
    let g = &BigUint::parse_bytes(g.as_bytes(), 10).unwrap();
    let x = &BigUint::parse_bytes(x.as_bytes(), 10).unwrap();

    let (r, s): (BigUint, BigUint) = dsa::sign(message, p, q, g, x);

    console_log(format!("{} {} {} {} {} {}", p, q, g, x, &r, &s).as_str());

    let r = r.to_bytes_be();
    let s = s.to_bytes_be();

    let mut encoded_signature = Vec::new();
    encoded_signature.extend(sha1::u32_to_bytes(r.len() as u32));
    encoded_signature.extend(r.to_vec());
    encoded_signature.extend(sha1::u32_to_bytes(s.len() as u32));
    encoded_signature.extend(s.to_vec());

    let mut result = Vec::new();
    result.extend(sha1::u32_to_bytes(encoded_signature.len() as u32));
    result.extend(encoded_signature);

    result[..].as_ptr()
}

#[wasm_bindgen]
pub fn verify(message: &str, r: &str, s: &str, p: &str, q: &str, g: &str, y: &str) -> bool {
    let message: &[u8] = message.as_bytes();

    let r = &BigUint::parse_bytes(r.as_bytes(), 10).unwrap();
    let s = &BigUint::parse_bytes(s.as_bytes(), 10).unwrap();
    let p = &BigUint::parse_bytes(p.as_bytes(), 10).unwrap();
    let q = &BigUint::parse_bytes(q.as_bytes(), 10).unwrap();
    let g = &BigUint::parse_bytes(g.as_bytes(), 10).unwrap();
    let y = &BigUint::parse_bytes(y.as_bytes(), 10).unwrap();

    dsa::verify(message, r, s, p, q, g, y)
}
