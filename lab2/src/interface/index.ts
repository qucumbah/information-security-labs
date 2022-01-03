import Matrix from '../logic/Matrix';
import * as util from '../logic/util';

const encryptedFileInput = document.querySelector('#encryptedFile') as HTMLInputElement;
const messageInput = document.querySelector('#message') as HTMLInputElement;

const messageStartInput = document.querySelector('#messageStart') as HTMLInputElement;
const matrixInput = document.querySelector('#matrix') as HTMLInputElement;

const invalidMatrixWarning = document.querySelector('#invalidMatrixWarning') as HTMLElement;

const decryptButton = document.querySelector('#decrypt') as HTMLInputElement;
const encryptButton = document.querySelector('#encrypt') as HTMLInputElement;

let matrix: Matrix | null = null;

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

  const messageString: string = messageInput.value;
  const message: Uint8Array = util.stringToUint8Array(messageString);
  const encryptedMessage: Uint8Array = util.transformMessage(message, matrix);

  console.log(message, encryptedMessage);

  const file = new Blob([encryptedMessage]);
  const link: HTMLAnchorElement = document.createElement('a');
  link.href = URL.createObjectURL(file);
  link.download = 'encrypted.txt';
  link.click();
  URL.revokeObjectURL(link.href);
});

let encryptedMessage: Uint8Array | null = null;
function updateEncryptedFile() {
  if (encryptedFileInput.files === null || encryptedFileInput.files.length === 0) {
    encryptedMessage = null;
    return;
  }

  const file: File = encryptedFileInput.files[0]!;
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.addEventListener('load', () => {
    encryptedMessage = new Uint8Array(reader.result as ArrayBuffer);
  });
}
encryptedFileInput.addEventListener('change', updateEncryptedFile);

decryptButton.addEventListener('click', () => {
  if (encryptedMessage === null) {
    alert('Файл не был выбран');
    return;
  }

  const messageStart: Uint8Array = util.stringToUint8Array(messageStartInput.value);

  const crackedMatrix: Matrix | null = util.crackMatrix(encryptedMessage, messageStart);

  if (crackedMatrix === null) {
    alert('Не получилось расшифровать матрицу перестановки битов. Возможно, начало сообщения содержит слишком мало символов.');
    return;
  }

  const decryptedMessage: Uint8Array = util.transformMessage(encryptedMessage, crackedMatrix);
  messageInput.value = util.Uint8ArrayToString(decryptedMessage);
});
