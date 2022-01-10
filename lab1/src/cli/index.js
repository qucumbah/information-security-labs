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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "fs", "readline", "./ioUtil", "../common/encrypt", "../common/decrypt"], function (require, exports, fs, readline, ioUtil, encrypt_1, decrypt_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    fs = __importStar(fs);
    readline = __importStar(readline);
    ioUtil = __importStar(ioUtil);
    encrypt_1 = __importDefault(encrypt_1);
    decrypt_1 = __importDefault(decrypt_1);
    function main() {
        return __awaiter(this, void 0, void 0, function* () {
            const modeString = (yield prompt('Encrypt (e) or decrypt (d): ')).toLowerCase();
            if (modeString !== 'e' && modeString !== 'd') {
                console.log('Invalid mode: ', modeString);
                process.exit(1);
            }
            const encryptMode = modeString === 'e';
            const input = yield prompt('Input: ');
            const inputContent = fs.readFileSync(input).toString();
            const output = yield prompt('Output: ');
            const rectangularMatrix = ioUtil.readMatrixFromFile('./data/rectangular.txt');
            const handler = encryptMode ? encrypt_1.default : decrypt_1.default;
            fs.writeFileSync(output, handler(inputContent, rectangularMatrix));
        });
    }
    main();
    function prompt(message) {
        const promptSession = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        return new Promise((resolve) => {
            promptSession.question(message, (answer) => {
                promptSession.close();
                resolve(answer);
            });
        });
    }
});
