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
define(["require", "exports", "../logic/util"], function (require, exports, util) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    util = __importStar(util);
    const encryptedFileInput = document.querySelector('#encryptedFile');
    const messageInput = document.querySelector('#message');
    const messageStartInput = document.querySelector('#messageStart');
    const matrixInput = document.querySelector('#matrix');
    const invalidMatrixWarning = document.querySelector('#invalidMatrixWarning');
    const decryptButton = document.querySelector('#decrypt');
    const encryptButton = document.querySelector('#encrypt');
    let matrix = null;
    function updateMatrix() {
        matrix = util.readMatrix(matrixInput.value);
        invalidMatrixWarning.style.opacity = (matrix === null) ? '1' : '0';
        encryptButton.disabled = matrix === null;
    }
    matrixInput.addEventListener('input', updateMatrix);
    updateMatrix();
    encryptButton.addEventListener('click', () => {
        if (matrix === null) {
            return;
        }
        const messageString = messageInput.value;
        const message = util.stringToUint8Array(messageString);
        const encryptedMessage = util.transformMessage(message, matrix);
        console.log(message, encryptedMessage);
        const file = new Blob([encryptedMessage]);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = 'encrypted.txt';
        link.click();
        URL.revokeObjectURL(link.href);
    });
    let encryptedMessage = null;
    function updateEncryptedFile() {
        if (encryptedFileInput.files === null || encryptedFileInput.files.length === 0) {
            encryptedMessage = null;
            return;
        }
        const file = encryptedFileInput.files[0];
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.addEventListener('load', () => {
            encryptedMessage = new Uint8Array(reader.result);
        });
    }
    encryptedFileInput.addEventListener('change', updateEncryptedFile);
    decryptButton.addEventListener('click', () => {
        if (encryptedMessage === null) {
            alert('Файл не был выбран');
            return;
        }
        const messageStart = util.stringToUint8Array(messageStartInput.value);
        const crackedMatrix = util.crackMatrix(encryptedMessage, messageStart);
        if (crackedMatrix === null) {
            alert('Не получилось расшифровать матрицу перестановки битов. Возможно, начало сообщения содержит слишком мало символов.');
            return;
        }
        const decryptedMessage = util.transformMessage(encryptedMessage, crackedMatrix);
        messageInput.value = util.Uint8ArrayToString(decryptedMessage);
    });
});
