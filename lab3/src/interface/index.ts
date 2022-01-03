const messageInput = document.querySelector('#messageInput') as HTMLInputElement;
const keyInput = document.querySelector('#keyInput') as HTMLInputElement;

const decryptButton = document.querySelector('#decrypt') as HTMLInputElement;
const encryptButton = document.querySelector('#encrypt') as HTMLInputElement;

let message: Uint8Array | null = null;
function updateMessage() {
  if (messageInput.files === null || messageInput.files.length === 0) {
    message = null;
    return;
  }

  const file: File = messageInput.files[0]!;
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.addEventListener('load', () => {
    message = new Uint8Array(reader.result as ArrayBuffer);
  });
}
messageInput.addEventListener('change', updateMessage);

let key: Uint8Array | null = null;
function updateKey() {
  if (keyInput.files === null || keyInput.files.length === 0) {
    key = null;
    return;
  }

  const file: File = keyInput.files[0]!;
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.addEventListener('load', () => {
    key = new Uint8Array(reader.result as ArrayBuffer);
  });
}
keyInput.addEventListener('change', updateKey);



function createFileDownload(fileContent: Uint8Array): void {
  const file = new Blob([fileContent]);
  const link: HTMLAnchorElement = document.createElement('a');
  link.href = URL.createObjectURL(file);
  link.download = 'output.txt';
  link.click();
  URL.revokeObjectURL(link.href);
}
