#![allow(dead_code)]
#![allow(non_snake_case)]

use crate::sha1;

use num_bigint_dig::{BigUint, RandBigInt, ModInverse};
use num_bigint_dig;

pub fn generate_p_q(L: u32, N: u32) -> (BigUint, BigUint) {
    let n: u32 = (L - 1) / N;
    let b: u32 = (L - 1) % N;

    loop {
        let (q, s): (BigUint, BigUint) = generate_q(N);
        if let Some(p) = generate_p(L, N, n, b, &q, &s) {
            return (p, q);
        }
    }
}

fn generate_q(N: u32) -> (BigUint, BigUint) {
    loop {
        let s: BigUint = rand_range(&bignum(1), &pow(&bignum(2), &bignum(N)));
        let a: [u8; 20] = sha1::hash(&s.to_bytes_be()[..]);
        let zz = (&s + &bignum(1)) % pow(&bignum(2), &bignum(N));
        let z: [u8; 20] = sha1::hash(&zz.to_bytes_be()[..]);
        let u = BigUint::from_bytes_be(&a) ^ BigUint::from_bytes_be(&z);
        let mask = &pow(&bignum(2), &bignum(N - 1)) + &bignum(1);
        let q = u | mask;
        if is_prime(&q) {
            return (q.to_owned(), s.to_owned());
        }
    }
}

fn generate_p(L: u32, N: u32, n: u32, b: u32, q: &BigUint, s: &BigUint) -> Option<BigUint> {
    let mut j = 2;
    for _ in 0..4096 {
        let mut V: Vec<BigUint> = Vec::new();
        for k in 0..n + 1 {
            let arg: BigUint = (s + &bignum(j) + &bignum(k)) % pow(&bignum(2), &bignum(N));
            let zzv: [u8; 20] = sha1::hash(&arg.to_bytes_be()[..]);
            V.push(BigUint::from_bytes_be(&zzv));
        }

        let mut W = bignum(0);
        for qq in 0..n {
            W = W + &V[qq as usize] * &pow(&bignum(2), &(bignum(160) * bignum(qq)));
        }

        W = W + (&V[n as usize] % &pow(&bignum(2), &bignum(b)) * &pow(&bignum(2), &(bignum(160) * bignum(n))));
        let X = &W + &pow(&bignum(2), &bignum(L - 1));
        let c = &X % (&bignum(2) * q);
        let p = &X - (c - bignum(1));

        if p.ge(&pow(&bignum(2), &bignum(L - 1))) && is_prime(&p) {
            return Some(p);
        }

        j += n + 1;
    }

    Option::None
}

pub fn generate_g(p: &BigUint, q: &BigUint) -> BigUint {
    loop {
        let h = rand_range(&bignum(2), &(p - &bignum(1)));
        let exp = (p - bignum(1)) / q;
        let g = BigUint::modpow(&h, &exp, &p);
        if g.gt(&bignum(1)) {
            return g;
        }
    }
}

pub fn generate_keys(p: &BigUint, q: &BigUint, g: &BigUint) -> (BigUint, BigUint) {
    let x = rand_range(&bignum(2), &q);
    let y = BigUint::modpow(g, &x, p);
    (x, y)
}

pub fn sign(message: &[u8], p: &BigUint, q: &BigUint, g: &BigUint, x: &BigUint) -> (BigUint, BigUint) {
    loop {
        let k = rand_range(&bignum(2), &q);
        let r = &BigUint::modpow(g, &k, p) % q;
        if r == bignum(0) {
            continue;
        }

        let m = BigUint::from_bytes_be(&sha1::hash(message));
        let inv = BigUint::mod_inverse(k, q);

        if inv == None {
            continue;
        }

        let inv = inv.unwrap().to_biguint().unwrap();

        let s = (&inv * &(m + x * &r)) % q;
        if s == bignum(0) {
            continue;
        }

        return (r, s);
    }
}

pub fn verify(message: &[u8], r: &BigUint, s: &BigUint, p: &BigUint, q: &BigUint, g: &BigUint, y: &BigUint) -> bool {
    if !validate_sign(r, s, q) {
        return false;
    }

    let w = s.mod_inverse(q);
    if w == None {
        return false;
    }

    let w = w.unwrap().to_biguint().unwrap();
    let m = BigUint::from_bytes_be(&sha1::hash(message));

    let u1 = m * &w % q;
    let u2 = r * &w % q;
    let v = (BigUint::modpow(g, &u1, p) * BigUint::modpow(y, &u2, p)) % p % q;

    &v == r
}

fn validate_sign(r: &BigUint, s: &BigUint, q: &BigUint) -> bool {
    if r < &bignum(0) && r > q {
        return false;
    }

    if s < &bignum(0) && s > q {
        return false;
    }

    return true;
}

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
    use num_bigint_dig::{BigInt, Sign};

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
        assert_eq!(bignum(17).mod_inverse(&bignum(3120)), Some(BigInt::from_slice(Sign::Plus, &[2753])));
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

    #[test]
    fn generate_p_q_test() {
        let (p, q): (BigUint, BigUint) = generate_p_q(1024, 160);
        assert_eq!(p % q, bignum(1));
    }

    #[test]
    fn generate_g_test() {
        let p = bignum_dec(b"89884656743115795444292670506545122404369547516120638242246041147329121184577153793214631043085152630351753572553065202207818807644735184441806966960815938804019549932554217646356011912882161452569715573167181651910255087932029445748092570475589051328367794913477088996494912554654832203549349274420353558743");
        let q = bignum_dec(b"1037760728721891820706685630761403650200206573193");
        let g = generate_g(
            &p,
            &q,
        );

        assert!(g.gt(&bignum(1)));
        assert!(g.lt(&(p - bignum(1))));
    }

    #[test]
    fn generate_p_q_g_test() {
        let (p, q): (BigUint, BigUint) = generate_p_q(1024, 160);
        let g = generate_g(&p, &q);

        assert!(g.gt(&bignum(1)));
        assert!(g.lt(&(&p - &bignum(1))));

        println!("{}", &p);
        println!("{}", &q);
        println!("{}", &g);
    }

    #[test]
    fn generate_keys_test() {
        let p = bignum_dec(b"89884656743115795444292670506545122404369547516120638242246041147329121184577153793214631043085152630351753572553065202207818807644735184441806966960815938804019549932554217646356011912882161452569715573167181651910255087932029445748092570475589051328367794913477088996494912554654832203549349274420353558743");
        let q = bignum_dec(b"1037760728721891820706685630761403650200206573193");
        let g = bignum_dec(b"85588551305862488755900255048766199834119825006291566771159904328636942469104416382511597967737368036355223495936081063512778209146536993964808310113488347055781098188045052174684529230294726548862504339579425903754767219964660220008587875650124042734568649409817169138724774262204663207226523331086035940042");

        let (x, y) = generate_keys(&p, &q, &g);

        assert!(x.gt(&bignum(0)));
        assert!(x.lt(&q));

        assert_eq!(y, BigUint::modpow(&g, &x, &p));
    }

    #[test]
    fn sign_test() {
        let p = bignum_dec(b"89884656743115795444292670506545122404369547516120638242246041147329121184577153793214631043085152630351753572553065202207818807644735184441806966960815938804019549932554217646356011912882161452569715573167181651910255087932029445748092570475589051328367794913477088996494912554654832203549349274420353558743");
        let q = bignum_dec(b"1037760728721891820706685630761403650200206573193");
        let g = bignum_dec(b"85588551305862488755900255048766199834119825006291566771159904328636942469104416382511597967737368036355223495936081063512778209146536993964808310113488347055781098188045052174684529230294726548862504339579425903754767219964660220008587875650124042734568649409817169138724774262204663207226523331086035940042");

        let (x, _y) = generate_keys(&p, &q, &g);

        let (_r, _s) = sign("Some message".as_bytes(), &p, &q, &g, &x);
    }

    #[test]
    fn sign_and_verify_test() {
        let p = bignum_dec(b"89884656743115795444292670506545122404369547516120638242246041147329121184577153793214631043085152630351753572553065202207818807644735184441806966960815938804019549932554217646356011912882161452569715573167181651910255087932029445748092570475589051328367794913477088996494912554654832203549349274420353558743");
        let q = bignum_dec(b"1037760728721891820706685630761403650200206573193");
        let g = bignum_dec(b"41111043471889822114077449753681251913650222334152891898095001378720972254299986691277178549972320471707730757549237744933423087875474991586286638436923935433111761014463669008673610743150642573208990715144885448905962650691480954012967616972365157864402532679435621707164808895814554644686485453337565381608");

        let x = bignum_dec(b"11150843081899901213446224036730032775956008097");
        let y = bignum_dec(b"13130317160934724365477893734511159857232564204894475379341210027653821707155845493326520282773656544798053533681192992543359273019697253594045426284856458829174483068527094293579844898161111775712584546064273699222796610531861608014999622340810777277617702558636374896713831259321672876023755526534577732070");

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

        println!("p: {}", p);
        println!("q: {}", q);
        println!("g: {}", g);
        println!("x: {}", x);
        println!("y: {}", y);
        println!("r: {}", r);
        println!("s: {}", s);
    }
}
