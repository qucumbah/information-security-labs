const messageInput = document.querySelector('#message') as HTMLInputElement;
const messageFileInput = document.querySelector('#messageFile') as HTMLInputElement;

const hashOutput = document.querySelector('#hash') as HTMLInputElement;

messageInput.addEventListener('input', () => {
  const message: string = messageInput.value;
  if (message.length === 0) {
    hashOutput.value = '';
    return;
  }

  hashOutput.value = `Hash for ${message}`
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
