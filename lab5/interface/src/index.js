var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// @ts-nocheck
import loadLogic, { initialize, generate_params, sign, verify } from '../../logic/pkg/logic.js';
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const initOutput = yield loadLogic();
        initialize();
        const messageInput = document.querySelector('#message');
        const messageFileInput = document.querySelector('#messageFile');
        messageFileInput.addEventListener('change', () => {
            if (messageFileInput.files === null || messageFileInput.files.length === 0) {
                return;
            }
            const file = messageFileInput.files[0];
            const reader = new FileReader();
            reader.readAsText(file);
            reader.addEventListener('load', () => {
                messageInput.value = reader.result;
                messageInput.dispatchEvent(new Event('input'));
                updateElementsState();
            });
        });
        const pInput = document.querySelector('#pInput');
        const qInput = document.querySelector('#qInput');
        const gInput = document.querySelector('#gInput');
        const xInput = document.querySelector('#xInput');
        const yInput = document.querySelector('#yInput');
        const generateParametersButton = document.querySelector('#generateParametersButton');
        generateParametersButton.addEventListener('click', () => {
            // First 4 bytes are encoded parameters length
            const encodedParamsLengthPtr = generate_params();
            const encodedParamsLength = readU32(new Uint8Array(initOutput.memory.buffer, encodedParamsLengthPtr, 4), 0);
            // Encoded parameters format:
            // p byte length: u32
            // bytes of p
            // q byte length: u32
            // bytes of q
            // g byte length: u32
            // bytes of g
            // x byte length: u32
            // bytes of x
            // y byte length: u32
            // bytes of y
            const encodedParamsPtr = encodedParamsLengthPtr + 4;
            const encodedParams = new Uint8Array(initOutput.memory.buffer, encodedParamsPtr, encodedParamsLength);
            let offset = 0;
            const pLength = readU32(encodedParams, offset);
            offset += 4;
            const p = bytesToBigInt(encodedParams, offset, pLength);
            offset += pLength;
            pInput.value = p;
            const qLength = readU32(encodedParams, offset);
            offset += 4;
            const q = bytesToBigInt(encodedParams, offset, qLength);
            offset += qLength;
            qInput.value = q;
            const gLength = readU32(encodedParams, offset);
            offset += 4;
            const g = bytesToBigInt(encodedParams, offset, gLength);
            offset += gLength;
            gInput.value = g;
            const xLength = readU32(encodedParams, offset);
            offset += 4;
            const x = bytesToBigInt(encodedParams, offset, xLength);
            offset += xLength;
            xInput.value = x;
            const yLength = readU32(encodedParams, offset);
            offset += 4;
            const y = bytesToBigInt(encodedParams, offset, yLength);
            yInput.value = y;
            updateElementsState();
            console.log(pLength, p);
            console.log(qLength, q);
            console.log(gLength, g);
            console.log(xLength, x);
            console.log(yLength, y);
            console.log(encodedParamsLength, offset);
        });
        const rInput = document.querySelector('#rInput');
        const sInput = document.querySelector('#sInput');
        const generateSignatureButton = document.querySelector('#generateSignatureButton');
        generateSignatureButton.addEventListener('click', () => {
            if (messageInput.value.length === 0
                || pInput.value.length === 0
                || qInput.value.length === 0
                || gInput.value.length === 0
                || xInput.value.length === 0) {
                alert('Нужно заполнить поля сообщения и параметров');
                return;
            }
            const message = messageInput.value;
            // Pass these values as decimal strings. They'll be parsed on the rust side
            const p = pInput.value;
            const q = qInput.value;
            const g = gInput.value;
            const x = xInput.value;
            // First 4 bytes are encoded signature length
            const encodedSignatureLengthPtr = sign(message, p, q, g, x);
            const encodedSignatureLength = readU32(new Uint8Array(initOutput.memory.buffer, encodedSignatureLengthPtr, 4), 0);
            // Encoded signature format:
            // r byte length: u32
            // bytes of r
            // s byte length: u32
            // bytes of s
            const encodedSignaturePtr = encodedSignatureLengthPtr + 4;
            const encodedSignature = new Uint8Array(initOutput.memory.buffer, encodedSignaturePtr, encodedSignatureLength);
            let offset = 0;
            const rLength = readU32(encodedSignature, offset);
            offset += 4;
            const r = bytesToBigInt(encodedSignature, offset, rLength);
            offset += rLength;
            rInput.value = r;
            const sLength = readU32(encodedSignature, offset);
            offset += 4;
            const s = bytesToBigInt(encodedSignature, offset, sLength);
            offset += sLength;
            sInput.value = s;
            updateElementsState();
        });
        const signatureValidElement = document.querySelector('#signatureValid');
        const signatureInvalidElement = document.querySelector('#signatureInvalid');
        const signatureUncheckedElement = document.querySelector('#signatureUnchecked');
        const checkSignatureButton = document.querySelector('#checkSignatureButton');
        checkSignatureButton.addEventListener('click', () => {
            if (messageInput.value.length === 0
                || rInput.value.length === 0
                || sInput.value.length === 0
                || pInput.value.length === 0
                || qInput.value.length === 0
                || gInput.value.length === 0
                || yInput.value.length === 0) {
                alert('Нужно заполнить поля сообщения, параметров и подписи');
                return;
            }
            const message = messageInput.value;
            // Pass these values as decimal strings. They'll be parsed on the rust side
            const r = rInput.value;
            const s = sInput.value;
            const p = pInput.value;
            const q = qInput.value;
            const g = gInput.value;
            const y = yInput.value;
            const verified = verify(message, r, s, p, q, g, y);
            signatureValidElement.style.display = verified ? 'block' : 'none';
            signatureInvalidElement.style.display = verified ? 'none' : 'block';
            signatureUncheckedElement.style.display = 'none';
            checkSignatureButton.disabled = true;
        });
        function updateElementsState() {
            generateSignatureButton.disabled = (messageInput.value.length === 0
                || pInput.value.length === 0
                || qInput.value.length === 0
                || gInput.value.length === 0
                || xInput.value.length === 0);
            checkSignatureButton.disabled = (messageInput.value.length === 0
                || rInput.value.length === 0
                || sInput.value.length === 0
                || pInput.value.length === 0
                || qInput.value.length === 0
                || gInput.value.length === 0
                || yInput.value.length === 0);
            signatureValidElement.style.display = 'none';
            signatureInvalidElement.style.display = 'none';
            signatureUncheckedElement.style.display = 'block';
            checkSignatureButton.disabled = false;
        }
        [
            messageInput,
            pInput,
            qInput,
            gInput,
            xInput,
            yInput,
            rInput,
            sInput,
        ].forEach((input) => {
            input.addEventListener('input', updateElementsState);
            input.addEventListener('change', updateElementsState);
        });
    });
}
function readU32(bytes, offset) {
    return ((bytes[offset + 0] << 24)
        + (bytes[offset + 1] << 16)
        + (bytes[offset + 2] << 8)
        + (bytes[offset + 3] << 0));
}
function bytesToBigInt(bytes, offset, length) {
    let result = 0n;
    for (let i = 0; i < length; i += 1) {
        result <<= 8n;
        result += BigInt(bytes[offset + i]);
    }
    return result;
}
function bytesToHexString(bytes, offset, length) {
    return bytes.slice(offset, offset + length).map(byteToHex).join('');
}
function byteToHex(byte) {
    return ((byte < 16) ? '0' : '') + byte.toString(16);
}
main();
