function test(): void {
}
test();

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
  console.log('Ok:', message);
}

function format(message: string): string {
  return message.replace(/#/g, '\0');
}
