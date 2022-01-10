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
define(["require", "exports", "../src/cli/ioUtil", "../src/common/util", "../src/common/decrypt", "../src/common/encrypt"], function (require, exports, ioUtil, util, decrypt_1, encrypt_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ioUtil = __importStar(ioUtil);
    util = __importStar(util);
    decrypt_1 = __importDefault(decrypt_1);
    encrypt_1 = __importDefault(encrypt_1);
    function test() {
        const smallMatrix = ioUtil.readMatrixFromFile('./data/small.txt');
        assert((0, decrypt_1.default)('abcde', smallMatrix) === 'bacde', 'Decrypt correctly with a small matrix');
        assert((0, encrypt_1.default)('abcde', smallMatrix) === format('bacd#e##'), 'Encrypt correctly with a small matrix');
        const longMessageForSmallMatrix = 'qwertyuiopasdfghjklzxcvbnm1234567890QWERTYUIOPASDFGHJKLZXCVBNM';
        assert((0, decrypt_1.default)((0, encrypt_1.default)(longMessageForSmallMatrix, smallMatrix), smallMatrix) === longMessageForSmallMatrix, 'Decrypt message back');
        const largeMatrix = ioUtil.readMatrixFromFile('./data/square.txt');
        const message = 'abcdefghijklmnop';
        assert((0, decrypt_1.default)((0, encrypt_1.default)(message, largeMatrix), largeMatrix) === message, 'Decrypt message back with large square matrix');
        const message2 = 'abcdefghijklmnopq';
        assert((0, encrypt_1.default)(message2, largeMatrix) === format('iaembnjfocgkhpld#q##############'), 'Encrypt out of bounds');
        assert((0, decrypt_1.default)((0, encrypt_1.default)(message2, largeMatrix), largeMatrix) === message2, 'Decrypt message back out of bounds');
        assert(util.testMatrix(largeMatrix), 'Valid large square matrix');
        const rectangularMatrix = ioUtil.readMatrixFromFile('./data/rectangular.txt');
        assert(util.testMatrix(rectangularMatrix), 'Valid rectangular matrix');
        const invalidMatrix = ioUtil.readMatrixFromFile('./data/invalid.txt');
        assert(!util.testMatrix(invalidMatrix), 'Invalid rectangular matrix');
        const longMessage1 = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKL';
        assert((0, encrypt_1.default)(longMessage1, largeMatrix) === format('iaembnjfocgkhpldyqu2r3zv4sw0x51tE6AI7JFBK8CGDLH9'), 'Encrypt large message');
        assert((0, decrypt_1.default)((0, encrypt_1.default)(longMessage1, largeMatrix), largeMatrix) === longMessage1, 'Decrypt large message');
        const longMessage2 = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOP';
        assert((0, encrypt_1.default)(longMessage2, largeMatrix) === format('iaembnjfocgkhpldyqu2r3zv4sw0x51tE6AI7JFBK8CGDLH9#M##N####O#####P'), 'Encrypt large message out of bounds');
        assert((0, decrypt_1.default)((0, encrypt_1.default)(longMessage2, largeMatrix), largeMatrix) === longMessage2, 'Encrypt large message out of bounds');
        const beforeRotation = [
            [true, false],
            [false, false],
        ];
        const afterRotation1 = util.rotate(beforeRotation);
        assert(afterRotation1[0][1] === true, 'Rotation 1');
        const afterRotation2 = util.rotate(afterRotation1);
        assert(afterRotation2[1][1] === true, 'Rotation 2');
        const afterRotation3 = util.rotate(afterRotation2);
        assert(afterRotation3[1][0] === true, 'Rotation 3');
        const afterRotation4 = util.rotate(afterRotation3);
        assert(afterRotation4[0][0] === true, 'Rotation 4');
    }
    test();
    function assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
        console.log('Ok:', message);
    }
    function format(message) {
        return message.replace(/#/g, '\0');
    }
});
