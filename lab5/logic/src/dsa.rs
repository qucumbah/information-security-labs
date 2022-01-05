#![allow(dead_code)]

use crate::sha1;

use std::ops::{Sub, Add};
use std::cmp::max;

use openssl::{bn::{BigNum, BigNumContext}};

// fn generate_p_q(L: usize, N: usize) -> (Vec<u8>, Vec<u8>) {
//     let n: usize = (L - 1) / N;
//     let b: usize = (L - 1) % N;

//     loop {
//         // let q = generate_q();
//     }
// }

fn generate_q(n: u32) -> BigNum {
    loop {
        let s: BigNum = rand_range(bignum(1), pow(bignum(2), bignum(n)));
        let a: [u8; 20] = sha1::hash(&s.to_vec()[..]);
        let zz = modulus(add(s, bignum(1)), pow(bignum(2), bignum(n)));
        let z: [u8; 20] = sha1::hash(&zz.to_vec()[..]);
        let u = BigNum::from_slice(&hash_xor(a, z)).unwrap();
        let mask = add(pow(bignum(2), bignum(n - 1)), bignum(1));
        let q = or(u, mask);
        if is_prime(&q) {
            return q.to_owned().unwrap();
        }
    }
}

fn bignum(src: u32) -> BigNum {
    BigNum::from_u32(src).unwrap()
}

fn rand_range(from: BigNum, to: BigNum) -> BigNum {
    let diff = &from.sub(&to);
    let mut rand = BigNum::new().unwrap();
    diff.rand_range(&mut rand).unwrap();

    add(rand, from)
}

fn add(a: BigNum, b: BigNum) -> BigNum {
    (*&a.add(&b)).to_owned().unwrap()
}

fn modulus(a: BigNum, b: BigNum) -> BigNum {
    let mut result = BigNum::new().unwrap();
    result.nnmod(&a, &b, &mut BigNumContext::new().unwrap()).unwrap();
    result
}

fn pow(a: BigNum, b: BigNum) -> BigNum {
    let mut exp = BigNum::new().unwrap();
    exp.exp(&a, &b, &mut BigNumContext::new().unwrap()).unwrap();
    exp
}

fn hash_xor(a: [u8; 20], b: [u8; 20]) -> [u8; 20] {
    let mut result = [0u8; 20];
    for i in 0..20 {
        result[i] = a[i] ^ b[i];
    }
    result
}

fn or(a: BigNum, b: BigNum) -> BigNum {
    let mut result = BigNum::new().unwrap();
    for i in 0..max(a.num_bits(), b.num_bits()) {
        if a.is_bit_set(i) || b.is_bit_set(i) {
            result.set_bit(i).unwrap();
        }
    }

    result
}

fn is_prime(num: &BigNum) -> bool {
    num.is_prime(25, &mut BigNumContext::new().unwrap()).unwrap()
}

#[cfg(test)]
mod tests {
    use openssl::bn::{BigNum, BigNumContext};

    use crate::dsa::*;

    #[test]
    fn openssl_bignum_test() {
        let mut context = BigNumContext::new().unwrap();

        let a = BigNum::from_u32(123).unwrap();
        let b = BigNum::from_u32(4567).unwrap();
        let c = BigNum::from_u32(89).unwrap();

        let mut nnmod = BigNum::new().unwrap();
        nnmod.nnmod(&b, &a, &mut context).unwrap();
        assert_eq!(nnmod, BigNum::from_u32(16).unwrap());

        let mut powmod = BigNum::new().unwrap();
        powmod.mod_exp(&a, &c, &b, &mut context).unwrap();
        assert_eq!(powmod, BigNum::from_u32(3167).unwrap());
        
        let mut inverse = BigNum::new().unwrap();
        inverse.mod_inverse(&a, &b, &mut context).unwrap();
        assert_eq!(inverse, BigNum::from_u32(854).unwrap());
    }

    #[test]
    fn util_funcs_test(){
        assert_eq!(bignum(15), BigNum::from_u32(15).unwrap());
        assert_eq!(add(bignum(15), bignum(30)), BigNum::from_u32(45).unwrap());
        assert_eq!(modulus(bignum(15), bignum(6)), BigNum::from_u32(3).unwrap());
        assert_eq!(pow(bignum(3), bignum(2)), BigNum::from_u32(9).unwrap());
        assert_eq!(or(bignum(5), bignum(2)), BigNum::from_u32(7).unwrap());
        assert!(is_prime(&bignum(5)));
    }
}
