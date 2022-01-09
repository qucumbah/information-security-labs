#![allow(dead_code)]
#![allow(non_snake_case)]

// use crate::sha1;

use num_bigint_dig::{BigUint, BigInt, RandBigInt, ModInverse, Sign};
use num_bigint_dig;
// use rand;

// pub fn generate_p_q(L: u32, N: u32) -> (BigNum, BigNum) {
//     let n: u32 = (L - 1) / N;
//     let b: u32 = (L - 1) % n;

//     loop {
//         let (q, s): (BigNum, BigNum) = generate_q(N);
//         if let Some(p) = generate_p(L, N, n, b, &q, &s) {
//             return (p, q);
//         }
//     }
// }

// fn generate_q(N: u32) -> (BigUint, BigUint) {
//     loop {
//         let s: BigNum = rand(&pow(&bignum(2), &bignum(N)).sub(&bignum(1))).add(&bignum(1));
//         let s: BigUint = 
//         let a: [u8; 20] = sha1::hash(&s.to_vec()[..]);
//         let zz = modulus(&add(&s, &bignum(1)), &pow(&bignum(2), &bignum(N)));
//         let z: [u8; 20] = sha1::hash(&zz.to_vec()[..]);
//         let u = BigNum::from_slice(&hash_xor(a, z)).unwrap();
//         let mask = add(&pow(&bignum(2), &bignum(N - 1)), &bignum(1));
//         let q = or(&u, &mask);
//         if is_prime(&q) {
//             return (q.to_owned().unwrap(), s.to_owned().unwrap());
//         }
//     }
// }

// fn generate_p(L: u32, N: u32, n: u32, b: u32, q: &BigNum, s: &BigNum) -> Option<BigNum> {
//     let mut j = 2;
//     for _ in 0..4096 {
//         let mut V: Vec<BigNum> = Vec::new();
//         for k in 0..n + 1 {
//             let arg: BigNum = modulus(&add(s, &add(&bignum(j), &bignum(k))), &pow(&bignum(2), &bignum(N)));
//             let zzv: [u8; 20] = sha1::hash(&arg.to_vec()[..]);
//             V.push(BigNum::from_slice(&zzv).unwrap());
//         }

//         let mut W = bignum(0);
//         for qq in 0..n {
//             W = add(&W, &mul(&V[qq as usize], &pow(&bignum(2), &mul(&bignum(160), &bignum(qq)))));
//         }

//         W = add(&W, &mul(&modulus(&V[n as usize], &pow(&bignum(2), &bignum(b))), &pow(&bignum(2), &mul(&bignum(160), &bignum(n)))));
//         let X = add(&W, &pow(&bignum(2), &bignum(L - 1)));
//         let c = modulus(&X, &mul(&bignum(2), q));
//         let p = sub(&X, &sub(&c, &bignum(1)));

//         if p.ge(&pow(&bignum(2), &bignum(L - 1))) && is_prime(&p) {
//             return Some(p);
//         }

//         j += n + 1;
//     }

//     Option::None
// }

// pub fn generate_g(p: &BigNum, q: &BigNum) -> BigNum {
//     loop {
//         let h = rand(&p.sub(&bignum(3))).add(&bignum(2));
//         let exp = div(&p.sub(&bignum(1)), &q);
//         let g = powmod(&h, &exp, &p);
//         if g.gt(&bignum(1)) {
//             return g;
//         }
//     }
// }

// pub fn generate_keys(p: &BigNum, q: &BigNum, g: &BigNum) -> (BigNum, BigNum) {
//     let x = rand(&q.sub(&bignum(2))).add(&bignum(2));
//     let y = powmod(g, &x, p);
//     (x, y)
// }

// pub fn sign(message: &[u8], p: &BigNum, q: &BigNum, g: &BigNum, x: &BigNum) -> (BigNum, BigNum) {
//     loop {
//         let k = rand(&q.sub(&bignum(2))).add(&bignum(2));
//         let r = modulus(&powmod(g, &k, p), q);
//         if r == bignum(0) {
//             continue;
//         }

//         let m = BigNum::from_slice(&sha1::hash(message)).unwrap();
//         let inv = inverse(&k, q);

//         if inv == None {
//             continue;
//         }

//         let s = modulus(&mul(&inv.unwrap(), &m.add(&mul(x, &r))), q);
//         if s == bignum(0) {
//             continue;
//         }

//         return (r, s);
//     }
// }

// pub fn verify(message: &[u8], r: &BigNum, s: &BigNum, p: &BigNum, q: &BigNum, g: &BigNum, y: &BigNum) -> bool {
//     if !validate_sign(r, s, q) {
//         return false;
//     }

//     let w = inverse(s, q);
//     if w == None {
//         return false;
//     }

//     let w = w.unwrap();
//     let m = BigNum::from_slice(&sha1::hash(message)).unwrap();

//     let u1 = modulus(&mul(&m, &w), q);
//     let u2 = modulus(&mul(&r, &w), q);
//     let v = modulus(&modulus(&mul(&powmod(g, &u1, p), &powmod(y, &u2, p)), p), q);

//     &v == r
// }

// fn validate_sign(r: &BigNum, s: &BigNum, q: &BigNum) -> bool {
//     if r < &bignum(0) && r > q {
//         return false;
//     }

//     if s < &bignum(0) && s > q {
//         return false;
//     }

//     return true;
// }

fn bignum(from: u32) -> BigUint {
    BigUint::from_slice(&[from])
}

fn bignum_dec(from: &[u8]) -> BigUint {
    BigUint::parse_bytes(from, 10).unwrap()
}

fn bignum_hex(from: &[u8]) -> BigUint {
    BigUint::parse_bytes(from, 16).unwrap()
}

fn rand_range(from: &BigUint, to: &BigUint) -> BigUint {
    let mut rand = rand::thread_rng();
    rand.gen_biguint_range(from, to)
}

fn is_prime(num: &BigUint) -> bool {
    num_bigint_dig::prime::probably_prime_miller_rabin(num, 25, false)
}

fn pow(base: &BigUint, exp: &BigUint) -> BigUint {
    // Max power we may have in this module is 2^1024
    BigUint::modpow(base, exp, &(bignum(1) << 1024))
}

#[cfg(test)]
mod tests {
    use crate::dsa::*;

    #[test]
    fn bignum_test() {
        let a = BigUint::from_slice(&[123]);
        let b = BigUint::from_slice(&[4567]);
        let c = BigUint::from_slice(&[89]);

        let modulus = &b % &a;
        assert_eq!(modulus, BigUint::from_slice(&[16]));

        let powmod = BigUint::modpow(&a, &c, &b);
        assert_eq!(powmod, BigUint::from_slice(&[3167]));

        let inverse = a.mod_inverse(&b).unwrap();
        assert_eq!(inverse, BigInt::from_slice(Sign::Plus, &[854]));
        
        assert_eq!(bignum(15), BigUint::from_slice(&[15]));
        assert_eq!(&bignum(15) + &bignum(30), BigUint::from_slice(&[45]));
        assert_eq!(&bignum(15) % &bignum(6), BigUint::from_slice(&[3]));
        assert_eq!(&bignum(5) | &bignum(2), BigUint::from_slice(&[7]));

        assert_eq!(bignum(23).mod_inverse(&bignum(10000007)), Some(BigInt::from_slice(Sign::Plus, &[5217395])));
        assert_eq!(bignum(16).mod_inverse(&bignum(48)), None);
    }

    #[test]
    fn util_funcs_test() {
        assert_eq!(pow(&bignum(3), &bignum(2)), BigUint::from_slice(&[9]));
        assert_eq!(pow(&bignum(2), &bignum(1023)), bignum_dec(b"89884656743115795386465259539451236680898848947115328636715040578866337902750481566354238661203768010560056939935696678829394884407208311246423715319737062188883946712432742638151109800623047059726541476042502884419075341171231440736956555270413618581675255342293149119973622969239858152417678164812112068608"));
        assert!(is_prime(&bignum(5)));
        assert!(is_prime(&bignum_dec(b"89884656743115795444292670506545122404369547516120638242246041147329121184577153793214631043085152630351753572553065202207818807644735184441806966960815938804019549932554217646356011912882161452569715573167181651910255087932029445748092570475589051328367794913477088996494912554654832203549349274420353558743")));
    }

    #[test]
    fn rand_test() {
        rand_range(&bignum(1), &bignum_hex(b"10000000000000000000000000000000000000000"));
    }

//     #[test]
//     fn generate_p_q_test() {
//         let (p, q): (BigNum, BigNum) = generate_p_q(1024, 160);
//         assert_eq!(modulus(&p, &q), bignum(1));
//     }

//     #[test]
//     fn generate_g_test() {
//         let p = BigNum::from_dec_str("89884656743115795444292670506545122404369547516120638242246041147329121184577153793214631043085152630351753572553065202207818807644735184441806966960815938804019549932554217646356011912882161452569715573167181651910255087932029445748092570475589051328367794913477088996494912554654832203549349274420353558743").unwrap();
//         let q = BigNum::from_dec_str("1037760728721891820706685630761403650200206573193").unwrap();
//         let g = generate_g(
//             &p,
//             &q,
//         );

//         assert!(g.gt(&bignum(1)));
//         assert!(g.lt(&p.sub(&bignum(1))));
//     }

//     #[test]
//     fn generate_keys_test() {
//         let p = BigNum::from_dec_str("89884656743115795444292670506545122404369547516120638242246041147329121184577153793214631043085152630351753572553065202207818807644735184441806966960815938804019549932554217646356011912882161452569715573167181651910255087932029445748092570475589051328367794913477088996494912554654832203549349274420353558743").unwrap();
//         let q = BigNum::from_dec_str("1037760728721891820706685630761403650200206573193").unwrap();
//         let g = BigNum::from_dec_str("85588551305862488755900255048766199834119825006291566771159904328636942469104416382511597967737368036355223495936081063512778209146536993964808310113488347055781098188045052174684529230294726548862504339579425903754767219964660220008587875650124042734568649409817169138724774262204663207226523331086035940042").unwrap();

//         let (x, y) = generate_keys(&p, &q, &g);

//         assert!(x.gt(&bignum(0)));
//         assert!(x.lt(&q));

//         assert_eq!(y, powmod(&g, &x, &p));
//     }

//     #[test]
//     fn sign_test() {
//         let p = BigNum::from_dec_str("89884656743115795444292670506545122404369547516120638242246041147329121184577153793214631043085152630351753572553065202207818807644735184441806966960815938804019549932554217646356011912882161452569715573167181651910255087932029445748092570475589051328367794913477088996494912554654832203549349274420353558743").unwrap();
//         let q = BigNum::from_dec_str("1037760728721891820706685630761403650200206573193").unwrap();
//         let g = BigNum::from_dec_str("85588551305862488755900255048766199834119825006291566771159904328636942469104416382511597967737368036355223495936081063512778209146536993964808310113488347055781098188045052174684529230294726548862504339579425903754767219964660220008587875650124042734568649409817169138724774262204663207226523331086035940042").unwrap();

//         let (x, y) = generate_keys(&p, &q, &g);

//         let (r, s) = sign("Some message".as_bytes(), &p, &q, &g, &x);
//     }

//     #[test]
//     fn sign_and_verify_test() {
//         let p = BigNum::from_dec_str("89884656743115795444292670506545122404369547516120638242246041147329121184577153793214631043085152630351753572553065202207818807644735184441806966960815938804019549932554217646356011912882161452569715573167181651910255087932029445748092570475589051328367794913477088996494912554654832203549349274420353558743").unwrap();
//         let q = BigNum::from_dec_str("1037760728721891820706685630761403650200206573193").unwrap();
//         let g = BigNum::from_dec_str("41111043471889822114077449753681251913650222334152891898095001378720972254299986691277178549972320471707730757549237744933423087875474991586286638436923935433111761014463669008673610743150642573208990715144885448905962650691480954012967616972365157864402532679435621707164808895814554644686485453337565381608").unwrap();

//         let x = BigNum::from_dec_str("11150843081899901213446224036730032775956008097").unwrap();
//         let y = BigNum::from_dec_str("13130317160934724365477893734511159857232564204894475379341210027653821707155845493326520282773656544798053533681192992543359273019697253594045426284856458829174483068527094293579844898161111775712584546064273699222796610531861608014999622340810777277617702558636374896713831259321672876023755526534577732070").unwrap();

//         let message = "Some message".as_bytes();
//         let (r, s) = sign(message, &p, &q, &g, &x);

//         assert!(verify(message, &r, &s, &p, &q, &g, &y));
//     }

//     #[test]
//     fn generate_sign_and_verify_test() {
//         let (p, q) = generate_p_q(1024, 160);
//         let g = generate_g(&p, &q);

//         let (x, y) = generate_keys(&p, &q, &g);

//         let message = "Some message".as_bytes();
//         let (r, s) = sign(message, &p, &q, &g, &x);

//         assert!(verify(message, &r, &s, &p, &q, &g, &y));

//         println!("p: {:?}", p);
//         println!("q: {:?}", q);
//         println!("g: {:?}", g);
//         println!("x: {:?}", x);
//         println!("y: {:?}", y);
//         println!("r: {:?}", r);
//         println!("s: {:?}", s);
//     }
}
