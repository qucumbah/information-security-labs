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
define(["require", "exports", "../common/util", "../common/encrypt", "../common/decrypt"], function (require, exports, util, encrypt_1, decrypt_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    util = __importStar(util);
    encrypt_1 = __importDefault(encrypt_1);
    decrypt_1 = __importDefault(decrypt_1);
    const plainElement = document.querySelector('#plain');
    const encryptedElement = document.querySelector('#encrypted');
    const matrixInput = document.querySelector('#matrix');
    const loadPlainElement = document.querySelector('#loadPlain');
    const loadEncryptedElement = document.querySelector('#loadEncrypted');
    const useRotationSection = document.querySelector('#useRotationSection');
    const useRotationCheckbox = document.querySelector('#useRotation');
    const invalidMatrixWarning = document.querySelector('#invalidMatrixWarning');
    const encryptButton = document.querySelector('#encrypt');
    const decryptButton = document.querySelector('#decrypt');
    let matrix = null;
    let useRotation = false;
    matrixInput.textContent = '# ##\n ###\n# ##\n### ';
    function readMatrixFromUserInput() {
        const matrixString = matrixInput.value;
        matrix = util.readMatrix(matrixString);
        const isSquare = ((matrix.length !== 0) && (matrix.length === matrix[0].length));
        useRotationSection.style.opacity = isSquare ? '1' : '0';
        if (!isSquare) {
            useRotation = false;
            useRotationCheckbox.checked = false;
        }
        const isValid = util.testMatrix(matrix);
        invalidMatrixWarning.style.opacity = isValid ? '0' : '1';
        encryptButton.disabled = !isValid;
        decryptButton.disabled = !isValid;
    }
    matrixInput.addEventListener('input', readMatrixFromUserInput);
    readMatrixFromUserInput();
    useRotationCheckbox.addEventListener('change', () => {
        useRotation = useRotationCheckbox.checked;
    });
    encryptButton.addEventListener('click', () => {
        if (matrix === null || !util.testMatrix(matrix)) {
            return;
        }
        const message = plainElement.value;
        const encryptedMessage = (0, encrypt_1.default)(message, matrix, useRotation);
        encryptedElement.value = encryptedMessage;
    });
    decryptButton.addEventListener('click', () => {
        if (matrix === null || !util.testMatrix(matrix)) {
            return;
        }
        const encryptedMessage = encryptedElement.value;
        const decryptedMessage = (0, decrypt_1.default)(encryptedMessage, matrix, useRotation);
        plainElement.value = decryptedMessage;
    });
    loadPlainElement.addEventListener('change', () => {
        if (loadPlainElement.files === null || loadPlainElement.files.length === 0) {
            return;
        }
        const file = loadPlainElement.files[0];
        const reader = new FileReader();
        reader.readAsText(file);
        reader.addEventListener('load', () => plainElement.value = reader.result.toString());
    });
    loadEncryptedElement.addEventListener('change', () => {
        if (loadEncryptedElement.files === null || loadEncryptedElement.files.length === 0) {
            return;
        }
        const file = loadEncryptedElement.files[0];
        const reader = new FileReader();
        reader.readAsText(file);
        reader.addEventListener('load', () => encryptedElement.value = reader.result.toString());
    });
});
