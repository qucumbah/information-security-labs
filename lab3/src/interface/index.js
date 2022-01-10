var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "../logic/decrypt", "../logic/encrypt"], function (require, exports, decrypt_1, encrypt_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    decrypt_1 = __importDefault(decrypt_1);
    encrypt_1 = __importDefault(encrypt_1);
    const messageInput = document.querySelector('#messageInput');
    const keyInput = document.querySelector('#keyInput');
    const decryptButton = document.querySelector('#decrypt');
    const encryptButton = document.querySelector('#encrypt');
    let message = null;
    function updateMessage() {
        if (messageInput.files === null || messageInput.files.length === 0) {
            message = null;
            return;
        }
        const file = messageInput.files[0];
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.addEventListener('load', () => {
            message = new Uint8Array(reader.result);
            const cipherAvailable = key !== null && message !== null;
            decryptButton.disabled = !cipherAvailable;
            encryptButton.disabled = !cipherAvailable;
        });
    }
    messageInput.addEventListener('change', updateMessage);
    let key = null;
    function updateKey() {
        if (keyInput.files === null || keyInput.files.length === 0) {
            key = null;
            return;
        }
        const file = keyInput.files[0];
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.addEventListener('load', () => {
            key = new Uint8Array(reader.result);
            const cipherAvailable = key !== null && message !== null;
            decryptButton.disabled = !cipherAvailable;
            encryptButton.disabled = !cipherAvailable;
        });
    }
    keyInput.addEventListener('change', updateKey);
    decryptButton.addEventListener('click', () => {
        if (key === null || message === null) {
            return;
        }
        createFileDownload((0, decrypt_1.default)(message, key));
    });
    encryptButton.addEventListener('click', () => {
        if (key === null || message === null) {
            return;
        }
        createFileDownload((0, encrypt_1.default)(message, key));
    });
    function createFileDownload(fileContent) {
        const file = new Blob([fileContent]);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = 'output.txt';
        link.click();
        URL.revokeObjectURL(link.href);
    }
});
