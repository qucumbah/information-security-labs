#![allow(dead_code)]
#![allow(non_snake_case)]

use crate::sha1;

use std::ops::{Sub, Add};
use std::cmp::max;

use openssl::bn::{BigNum, BigNumContext};

fn generate_p_q(L: u32, N: u32) -> (BigNum, BigNum) {
    let n: u32 = (L - 1) / N;
    let b: u32 = (L - 1) % n;

    loop {
        let (q, s): (BigNum, BigNum) = generate_q(N);
        if let Some(p) = generate_p(L, N, n, b, &q, &s) {
            return (p, q);
        }
    }
}

fn generate_q(N: u32) -> (BigNum, BigNum) {
    loop {
        let s: BigNum = rand_range(&bignum(1), &pow(&bignum(2), &bignum(N)));
        let a: [u8; 20] = sha1::hash(&s.to_vec()[..]);
        let zz = modulus(&add(&s, &bignum(1)), &pow(&bignum(2), &bignum(N)));
        let z: [u8; 20] = sha1::hash(&zz.to_vec()[..]);
        let u = BigNum::from_slice(&hash_xor(a, z)).unwrap();
        let mask = add(&pow(&bignum(2), &bignum(N - 1)), &bignum(1));
        let q = or(u, mask);
        if is_prime(&q) {
            return (q.to_owned().unwrap(), s.to_owned().unwrap());
        }
    }
}

fn generate_p(L: u32, N: u32, n: u32, b: u32, q: &BigNum, s: &BigNum) -> Option<BigNum> {
    let mut j = 2;
    for _ in 0..4096 {
        let mut V: Vec<BigNum> = Vec::new();
        for k in 0..n + 1 {
            let arg: BigNum = modulus(&add(s, &add(&bignum(j), &bignum(k))), &pow(&bignum(2), &bignum(N)));
            let zzv: [u8; 20] = sha1::hash(&arg.to_vec()[..]);
            V.push(BigNum::from_slice(&zzv).unwrap());
        }

        let mut W = bignum(0);
        for qq in 0..n {
            W = add(&W, &mul(&V[qq as usize], &pow(&bignum(2), &mul(&bignum(160), &bignum(qq)))));
        }

        W = add(&W, &mul(&modulus(&V[n as usize], &pow(&bignum(2), &bignum(b))), &pow(&bignum(2), &mul(&bignum(160), &bignum(n)))));
        let X = add(&W, &pow(&bignum(2), &bignum(L - 1)));
        let c = modulus(&X, &mul(&bignum(2), q));
        let p = sub(&X, &add(&c, &bignum(1)));

        if p.ge(&pow(&bignum(2), &bignum(L - 1))) {
            if is_prime(&p) {
                return Some(p);
            }
        }

        j += n + 1;
    }

    Option::None
}

fn bignum(src: u32) -> BigNum {
    BigNum::from_u32(src).unwrap()
}

fn rand_range(from: &BigNum, to: &BigNum) -> BigNum {
    let diff = from.sub(to);
    let mut rand = BigNum::new().unwrap();
    diff.rand_range(&mut rand).unwrap();

    add(&rand, from)
}

fn add(a: &BigNum, b: &BigNum) -> BigNum {
    (*a.add(b)).to_owned().unwrap()
}

fn sub(a: &BigNum, b: &BigNum) -> BigNum {
    (*a.sub(b)).to_owned().unwrap()
}

fn mul(a: &BigNum, b: &BigNum) -> BigNum {
    let mut result = BigNum::new().unwrap();
    result.checked_mul(&a, &b, &mut BigNumContext::new().unwrap()).unwrap();
    result
}

fn modulus(a: &BigNum, b: &BigNum) -> BigNum {
    let mut result = BigNum::new().unwrap();
    result.nnmod(&a, &b, &mut BigNumContext::new().unwrap()).unwrap();
    result
}

fn pow(a: &BigNum, b: &BigNum) -> BigNum {
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
        assert_eq!(add(&bignum(15), &bignum(30)), BigNum::from_u32(45).unwrap());
        assert_eq!(modulus(&bignum(15), &bignum(6)), BigNum::from_u32(3).unwrap());
        assert_eq!(pow(&bignum(3), &bignum(2)), BigNum::from_u32(9).unwrap());
        assert_eq!(or(bignum(5), bignum(2)), BigNum::from_u32(7).unwrap());
        assert!(is_prime(&bignum(5)));
    }
}
