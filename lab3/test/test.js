var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "fs", "path", "../src/logic/blockDecrypt", "../src/logic/blockEncrypt", "../src/logic/decrypt", "../src/logic/E", "../src/logic/encrypt", "../src/logic/generateSubKeys", "../src/logic/maskFrom", "../src/logic/rotl"], function (require, exports, fs, path, blockDecrypt_1, blockEncrypt_1, decrypt_1, E_1, encrypt_1, generateSubKeys_1, maskFrom_1, rotl_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    fs = __importStar(fs);
    path = __importStar(path);
    blockDecrypt_1 = __importDefault(blockDecrypt_1);
    blockEncrypt_1 = __importDefault(blockEncrypt_1);
    decrypt_1 = __importDefault(decrypt_1);
    E_1 = __importDefault(E_1);
    encrypt_1 = __importDefault(encrypt_1);
    generateSubKeys_1 = __importDefault(generateSubKeys_1);
    maskFrom_1 = __importDefault(maskFrom_1);
    rotl_1 = __importDefault(rotl_1);
    function test() {
        assertEquals((0, rotl_1.default)(0xa4a8d57b, 9), 1370158921, 'rotl');
        assertEquals((0, rotl_1.default)(0x3423832a, 5), -2073008826, 'rotl');
        assertEquals((0, rotl_1.default)(0xffffffff, 2), -1, 'rotl');
        assertEquals((0, rotl_1.default)(0xbacd3598, 3), -697717563, 'rotl');
        assertEquals((0, rotl_1.default)(0x1, 1), 2, 'rotl');
        assertEquals((0, maskFrom_1.default)(876543), 2145390588, 'maskFrom');
        assertEquals((0, maskFrom_1.default)(3232566), 2139095040, 'maskFrom');
        assertEquals((0, maskFrom_1.default)(2147482624), 1073740284, 'maskFrom');
        assertEquals((0, maskFrom_1.default)(2147482625), 1073739776, 'maskFrom');
        assertEquals((0, maskFrom_1.default)(4123566), 2139095040, 'maskFrom');
        const expectedSubkeys = [
            821420482,
            198584074,
            2944056906,
            703528370,
            1077994532,
            3955000615,
            1204253516,
            3736500923,
            2276703882,
            1080436411,
            4244873311,
            3115239275,
            314697540,
            2553578703,
            3671785227,
            2949853943,
            1975745412,
            3876151911,
            3802865789,
            2056057275,
            1233511326,
            1181574767,
            2293081780,
            2093880023,
            2268343886,
            3502180039,
            694556670,
            225767043,
            3383244144,
            4044414239,
            1044239188,
            2713534635,
            1513016169,
            1475178251,
            2983787265,
            1912741559,
            1658940775,
            402832766,
            575982260,
            2905481126
        ];
        const subKeys = (0, generateSubKeys_1.default)(new Uint8Array([112, -31, 10, -65]));
        for (let i = 0; i < 40; i += 1) {
            assertEquals(subKeys[i], expectedSubkeys[i], 'subkeys');
        }
        function testE(actual, expected) {
            for (let i = 0; i < 3; i += 1) {
                assertEquals(actual[i], expected[i], 'E');
            }
        }
        testE((0, E_1.default)(2147483647, 15, 2), [-485956883, 1073741831, -8389633]);
        testE((0, E_1.default)(325789, 4329875, 2436825), [2144440013, -2062024669, -1971322375]);
        testE((0, E_1.default)(582765, 337487, 13764623), [-911639670, 1884676096, 2040544616]);
        testE((0, E_1.default)(-325356, 25726, -257825), [-1853662477, -76705025, -1254324964]);
        const expectedDecryptedBlock = [
            247,
            144,
            46,
            251,
            227,
            213,
            134,
            71,
            151,
            131,
            25,
            228,
            102,
            110,
            119,
            204
        ];
        const block = new Uint8Array([-88, -35, -21, 23, 110, 17, 4, 40, 59, -16, -22, 31, -123, -109, -40, 22]);
        const decryptedBlock = new Uint8Array(16);
        (0, blockDecrypt_1.default)(block, 0, decryptedBlock, 0, subKeys);
        for (let i = 0; i < 16; i += 1) {
            assertEquals(decryptedBlock[i], expectedDecryptedBlock[i], 'block decrypt');
        }
        const newlyEncryptedBlock = new Uint8Array(16);
        (0, blockEncrypt_1.default)(decryptedBlock, 0, newlyEncryptedBlock, 0, subKeys);
        for (let i = 0; i < 16; i += 1) {
            assertEquals(newlyEncryptedBlock[i], block[i], 'block encrypt');
        }
        testEncryption('test/data1');
        testEncryption('test/data2');
    }
    test();
    function testEncryption(dataFolder) {
        const data = fs.readFileSync(path.join(dataFolder, 'data.txt'));
        const key = fs.readFileSync(path.join(dataFolder, 'key'));
        const expectedEncryptedData = fs.readFileSync(path.join(dataFolder, 'data.enc'));
        const encryptedData = (0, encrypt_1.default)(data, key);
        for (let i = 0; i < expectedEncryptedData.length; i += 1) {
            assertEquals(expectedEncryptedData[i], encryptedData[i], 'encrypt');
        }
        const decryptedData = (0, decrypt_1.default)(encryptedData, key);
        assertEquals(decryptedData.length, data.length, 'Decription data length match');
        for (let i = 0; i < data.length; i += 1) {
            assertEquals(decryptedData[i], data[i], `decrypt ${i}`);
        }
    }
    // @ts-ignore
    function assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
        console.log('Ok:', message);
    }
    function assertEquals(a, b, message) {
        if (a !== b) {
            console.log(a, '!=', b);
            throw new Error(message);
        }
        console.log('Ok:', message);
    }
    // @ts-ignore
    function format(message) {
        return message.replace(/#/g, '\0');
    }
});
