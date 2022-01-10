var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import loadLogic, { initialize, skein512_hash } from '../../logic/pkg/logic.js';
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const initOutput = yield loadLogic();
        initialize();
        const messageInput = document.querySelector('#message');
        const messageFileInput = document.querySelector('#messageFile');
        const hashOutput = document.querySelector('#hash');
        messageInput.addEventListener('input', () => {
            const message = messageInput.value;
            if (message.length === 0) {
                hashOutput.value = '';
                return;
            }
            const hashPtr = skein512_hash(message);
            const hashBytes = new Uint8Array(initOutput.memory.buffer, hashPtr, 64);
            const byteToHex = (byte) => ((byte < 16) ? '0' : '') + byte.toString(16);
            hashOutput.value = [...hashBytes].map(byteToHex).join('');
        });
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
            });
        });
    });
}
main();
