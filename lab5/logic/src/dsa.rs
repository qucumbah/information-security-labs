#![allow(dead_code)]

// fn generate_p_q(L: usize, N: usize) -> (Vec<u8>, Vec<u8>) {
//     let n: usize = (L - 1) / N;
//     let b: usize = (L - 1) % N;

//     loop {
//         // let q = generate_q();
//     }
// }

// fn generate_q(N: usize) -> Vec<u8> {
//     let s: &[u8] = &[0u8; N];
// }

#[cfg(test)]
mod tests {
    use openssl::bn::{BigNum, BigNumContext};

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
}
