import loadLogic, { initialize, InitOutput, skein512_hash } from '../../logic/pkg/logic.js';

async function main() {
  const initOutput: InitOutput = await loadLogic();
  initialize();

  const messageInput = document.querySelector('#message') as HTMLInputElement;
  const messageFileInput = document.querySelector('#messageFile') as HTMLInputElement;

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

  const pInput = document.querySelector('#pInput') as HTMLInputElement;
  const qInput = document.querySelector('#qInput') as HTMLInputElement;
  const gInput = document.querySelector('#gInput') as HTMLInputElement;
  const xInput = document.querySelector('#xInput') as HTMLInputElement;
  const yInput = document.querySelector('#yInput') as HTMLInputElement;

  const generateParametersButton = document.querySelector('#generateParametersButton') as HTMLInputElement;

  generateParametersButton.addEventListener('click', () => {
    
  });

  const rInput = document.querySelector('#rInput') as HTMLInputElement;
  const sInput = document.querySelector('#sInput') as HTMLInputElement;

  const generateSignatureButton = document.querySelector('#generateSignatureButton') as HTMLInputElement;

  const signatureValidElement = document.querySelector('#signatureValid') as HTMLElement;
  const signatureInvalidElement = document.querySelector('#signatureInvalid') as HTMLElement;

  const checkSignatureButton = document.querySelector('#checkSignatureButton') as HTMLInputElement;
}

main();
