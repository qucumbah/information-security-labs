#![allow(dead_code)]
#![allow(non_snake_case)]

use crate::sha1;

use std::ops::{Sub, Add};
use std::cmp::max;

use openssl::bn::{BigNum, BigNumContext};

pub fn generate_p_q(L: u32, N: u32) -> (BigNum, BigNum) {
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
        let s: BigNum = rand(&pow(&bignum(2), &bignum(N)).sub(&bignum(1))).add(&bignum(1));
        let a: [u8; 20] = sha1::hash(&s.to_vec()[..]);
        let zz = modulus(&add(&s, &bignum(1)), &pow(&bignum(2), &bignum(N)));
        let z: [u8; 20] = sha1::hash(&zz.to_vec()[..]);
        let u = BigNum::from_slice(&hash_xor(a, z)).unwrap();
        let mask = add(&pow(&bignum(2), &bignum(N - 1)), &bignum(1));
        let q = or(&u, &mask);
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
        let p = sub(&X, &sub(&c, &bignum(1)));

        if p.ge(&pow(&bignum(2), &bignum(L - 1))) && is_prime(&p) {
            return Some(p);
        }

        j += n + 1;
    }

    Option::None
}

pub fn generate_g(p: &BigNum, q: &BigNum) -> BigNum {
    loop {
        let h = rand(&p.sub(&bignum(3))).add(&bignum(2));
        let exp = div(&p.sub(&bignum(1)), &q);
        let g = powmod(&h, &exp, &p);
        if g.gt(&bignum(1)) {
            return g;
        }
    }
}

pub fn generate_keys(p: &BigNum, q: &BigNum, g: &BigNum) -> (BigNum, BigNum) {
    let x = rand(&q.sub(&bignum(2))).add(&bignum(2));
    let y = powmod(g, &x, p);
    (x, y)
}

pub fn sign(message: &[u8], p: &BigNum, q: &BigNum, g: &BigNum, x: &BigNum) -> (BigNum, BigNum) {
    loop {
        let k = rand(&q.sub(&bignum(2))).add(&bignum(2));
        let r = modulus(&powmod(g, &k, p), q);
        if r == bignum(0) {
            continue;
        }

        let m = BigNum::from_slice(&sha1::hash(message)).unwrap();
        let inv = inverse(&k, q);

        if inv == None {
            continue;
        }

        let s = modulus(&mul(&inv.unwrap(), &m.add(&mul(x, &r))), q);
        if s == bignum(0) {
            continue;
        }

        return (r, s);
    }
}

pub fn verify(message: &[u8], r: &BigNum, s: &BigNum, p: &BigNum, q: &BigNum, g: &BigNum, y: &BigNum) -> bool {
    if !validate_sign(r, s, q) {
        return false;
    }

    let w = inverse(s, q);
    if w == None {
        return false;
    }

    let w = w.unwrap();
    let m = BigNum::from_slice(&sha1::hash(message)).unwrap();

    let u1 = modulus(&mul(&m, &w), q);
    let u2 = modulus(&mul(&r, &w), q);
    let v = modulus(&modulus(&mul(&powmod(g, &u1, p), &powmod(y, &u2, p)), p), q);

    &v == r
}

fn validate_sign(r: &BigNum, s: &BigNum, q: &BigNum) -> bool {
    if r < &bignum(0) && r > q {
        return false;
    }

    if s < &bignum(0) && s > q {
        return false;
    }

    return true;
}

fn bignum(src: u32) -> BigNum {
    BigNum::from_u32(src).unwrap()
}

fn rand(upto: &BigNum) -> BigNum {
    let mut rand = BigNum::new().unwrap();

    upto.rand_range(&mut rand).unwrap();

    rand
}

fn add(a: &BigNum, b: &BigNum) -> BigNum {
    (*a.add(b)).to_owned().unwrap()
}

fn sub(a: &BigNum, b: &BigNum) -> BigNum {
    (*a.sub(b)).to_owned().unwrap()
}

fn mul(a: &BigNum, b: &BigNum) -> BigNum {
    let mut result = BigNum::new().unwrap();
    result.checked_mul(a, b, &mut BigNumContext::new().unwrap()).unwrap();
    result
}

fn div(a: &BigNum, b: &BigNum) -> BigNum {
    let mut result = BigNum::new().unwrap();
    result.checked_div(a, b, &mut BigNumContext::new().unwrap()).unwrap();
    result
}

fn modulus(a: &BigNum, b: &BigNum) -> BigNum {
    let mut result = BigNum::new().unwrap();
    result.nnmod(a, b, &mut BigNumContext::new().unwrap()).unwrap();
    result
}

fn pow(a: &BigNum, b: &BigNum) -> BigNum {
    let mut exp = BigNum::new().unwrap();
    exp.exp(a, b, &mut BigNumContext::new().unwrap()).unwrap();
    exp
}

fn powmod(a: &BigNum, b: &BigNum, c: &BigNum) -> BigNum {
    let mut result = BigNum::new().unwrap();
    result.mod_exp(a, b, c, &mut BigNumContext::new().unwrap()).unwrap();
    result
}

fn hash_xor(a: [u8; 20], b: [u8; 20]) -> [u8; 20] {
    let mut result = [0u8; 20];
    for i in 0..20 {
        result[i] = a[i] ^ b[i];
    }
    result
}

fn or(a: &BigNum, b: &BigNum) -> BigNum {
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

fn inverse(a: &BigNum, b: &BigNum) -> Option<BigNum> {
    let mut result = BigNum::new().unwrap();
    if let Ok(_) = result.mod_inverse(a, b, &mut BigNumContext::new().unwrap()) {
        Some(result)
    } else {
        None
    }
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
    fn util_funcs_test() {
        assert_eq!(bignum(15), BigNum::from_u32(15).unwrap());
        assert_eq!(add(&bignum(15), &bignum(30)), BigNum::from_u32(45).unwrap());
        assert_eq!(modulus(&bignum(15), &bignum(6)), BigNum::from_u32(3).unwrap());
        assert_eq!(pow(&bignum(3), &bignum(2)), BigNum::from_u32(9).unwrap());
        assert_eq!(or(&bignum(5), &bignum(2)), BigNum::from_u32(7).unwrap());
        assert!(is_prime(&bignum(5)));

        assert_eq!(inverse(&bignum(23), &bignum(10000007)), Some(bignum(5217395)));
        assert_eq!(inverse(&bignum(16), &bignum(48)), None);
    }

    #[test]
    fn rand_test() {
        rand(&BigNum::from_hex_str("10000000000000000000000000000000000000000").unwrap().sub(&bignum(1)));
    }

    #[test]
    fn generate_p_q_test() {
        let (p, q): (BigNum, BigNum) = generate_p_q(1024, 160);
        assert_eq!(modulus(&p, &q), bignum(1));
    }

    #[test]
    fn generate_g_test() {
        let p = BigNum::from_dec_str("89884656743115795444292670506545122404369547516120638242246041147329121184577153793214631043085152630351753572553065202207818807644735184441806966960815938804019549932554217646356011912882161452569715573167181651910255087932029445748092570475589051328367794913477088996494912554654832203549349274420353558743").unwrap();
        let q = BigNum::from_dec_str("1037760728721891820706685630761403650200206573193").unwrap();
        let g = generate_g(
            &p,
            &q,
        );

        assert!(g.gt(&bignum(1)));
        assert!(g.lt(&p.sub(&bignum(1))));
    }

    #[test]
    fn generate_keys_test() {
        let p = BigNum::from_dec_str("89884656743115795444292670506545122404369547516120638242246041147329121184577153793214631043085152630351753572553065202207818807644735184441806966960815938804019549932554217646356011912882161452569715573167181651910255087932029445748092570475589051328367794913477088996494912554654832203549349274420353558743").unwrap();
        let q = BigNum::from_dec_str("1037760728721891820706685630761403650200206573193").unwrap();
        let g = BigNum::from_dec_str("85588551305862488755900255048766199834119825006291566771159904328636942469104416382511597967737368036355223495936081063512778209146536993964808310113488347055781098188045052174684529230294726548862504339579425903754767219964660220008587875650124042734568649409817169138724774262204663207226523331086035940042").unwrap();

        let (x, y) = generate_keys(&p, &q, &g);

        assert!(x.gt(&bignum(0)));
        assert!(x.lt(&q));

        assert_eq!(y, powmod(&g, &x, &p));
    }

    #[test]
    fn sign_test() {
        let p = BigNum::from_dec_str("89884656743115795444292670506545122404369547516120638242246041147329121184577153793214631043085152630351753572553065202207818807644735184441806966960815938804019549932554217646356011912882161452569715573167181651910255087932029445748092570475589051328367794913477088996494912554654832203549349274420353558743").unwrap();
        let q = BigNum::from_dec_str("1037760728721891820706685630761403650200206573193").unwrap();
        let g = BigNum::from_dec_str("85588551305862488755900255048766199834119825006291566771159904328636942469104416382511597967737368036355223495936081063512778209146536993964808310113488347055781098188045052174684529230294726548862504339579425903754767219964660220008587875650124042734568649409817169138724774262204663207226523331086035940042").unwrap();

        let (x, y) = generate_keys(&p, &q, &g);

        let (r, s) = sign("Some message".as_bytes(), &p, &q, &g, &x);
    }

    #[test]
    fn sign_and_verify_test() {
        let p = BigNum::from_dec_str("89884656743115795444292670506545122404369547516120638242246041147329121184577153793214631043085152630351753572553065202207818807644735184441806966960815938804019549932554217646356011912882161452569715573167181651910255087932029445748092570475589051328367794913477088996494912554654832203549349274420353558743").unwrap();
        let q = BigNum::from_dec_str("1037760728721891820706685630761403650200206573193").unwrap();
        let g = BigNum::from_dec_str("41111043471889822114077449753681251913650222334152891898095001378720972254299986691277178549972320471707730757549237744933423087875474991586286638436923935433111761014463669008673610743150642573208990715144885448905962650691480954012967616972365157864402532679435621707164808895814554644686485453337565381608").unwrap();

        let x = BigNum::from_dec_str("11150843081899901213446224036730032775956008097").unwrap();
        let y = BigNum::from_dec_str("13130317160934724365477893734511159857232564204894475379341210027653821707155845493326520282773656544798053533681192992543359273019697253594045426284856458829174483068527094293579844898161111775712584546064273699222796610531861608014999622340810777277617702558636374896713831259321672876023755526534577732070").unwrap();

        let message = "Some message".as_bytes();
        let (r, s) = sign(message, &p, &q, &g, &x);

        assert!(verify(message, &r, &s, &p, &q, &g, &y));
    }

    #[test]
    fn generate_sign_and_verify_test() {
        let (p, q) = generate_p_q(1024, 160);
        let g = generate_g(&p, &q);

        let (x, y) = generate_keys(&p, &q, &g);

        let message = "Some message".as_bytes();
        let (r, s) = sign(message, &p, &q, &g, &x);

        assert!(verify(message, &r, &s, &p, &q, &g, &y));

        println!("p: {:?}", p);
        println!("q: {:?}", q);
        println!("g: {:?}", g);
        println!("x: {:?}", x);
        println!("y: {:?}", y);
        println!("r: {:?}", r);
        println!("s: {:?}", s);
    }
}
