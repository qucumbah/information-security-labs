import loadLogic, { initialize, InitOutput, skein512_hash } from '../../logic/pkg/logic.js';

async function main() {
  const initOutput: InitOutput = await loadLogic();
  initialize();

  const messageInput = document.querySelector('#message') as HTMLInputElement;
  const messageFileInput = document.querySelector('#messageFile') as HTMLInputElement;
  
  const hashOutput = document.querySelector('#hash') as HTMLInputElement;
  
  messageInput.addEventListener('input', () => {
    const message: string = messageInput.value;
    if (message.length === 0) {
      hashOutput.value = '';
      return;
    }
  
    const hashPtr: number = skein512_hash(message);
    const hashBytes = new Uint8Array(initOutput.memory.buffer, hashPtr, 64);

    const byteToHex = (byte: number) => ((byte < 16) ? '0' : '') + byte.toString(16);
    hashOutput.value = [...hashBytes].map(byteToHex).join('');
  });
  
  messageFileInput.addEventListener('change', () => {
    if (messageFileInput.files === null || messageFileInput.files.length === 0) {
      return;
    }
  
    const file: File = messageFileInput.files[0]!;
    const reader = new FileReader();
    reader.readAsText(file);
    reader.addEventListener('load', () => {
      messageInput.value = reader.result as string;
      messageInput.dispatchEvent(new Event('input'));
    });
  });
}

main();
