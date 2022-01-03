import * as util from '../common/util';
import Matrix from '../common/Matrix';
import encrypt from '../common/encrypt';
import decrypt from '../common/decrypt';

const plainElement = document.querySelector('#plain') as HTMLInputElement;
const encryptedElement = document.querySelector('#encrypted') as HTMLInputElement;
const matrixInput = document.querySelector('#matrix') as HTMLInputElement;

const useRotationSection = document.querySelector('#useRotationSection') as HTMLElement;
const useRotationCheckbox = document.querySelector('#useRotation') as HTMLInputElement;

const invalidMatrixWarning = document.querySelector('#invalidMatrixWarning') as HTMLElement;

const encryptButton = document.querySelector('#encrypt') as HTMLButtonElement;
const decryptButton = document.querySelector('#decrypt') as HTMLButtonElement;

let matrix: Matrix | null = null;
let useRotation: boolean = false;

matrixInput.textContent = '# ##\n ###\n# ##\n### ';

function readMatrixFromUserInput() {
  const matrixString: string = matrixInput.value;
  matrix = util.readMatrix(matrixString);

  const isSquare = ((matrix.length !== 0) && (matrix.length === matrix[0]!.length));
  useRotationSection.style.opacity = isSquare ? '1' : '0';

  if (!isSquare) {
    useRotation = false;
    useRotationCheckbox.checked = false;
  }

  const isValid: boolean = util.testMatrix(matrix);
  invalidMatrixWarning.style.opacity = isValid ? '0' : '1';

  encryptButton.disabled = !isValid;
  decryptButton.disabled = !isValid;
}

matrixInput.addEventListener('input', readMatrixFromUserInput);
readMatrixFromUserInput();

useRotationCheckbox.addEventListener('change', () => {
  useRotation = useRotationCheckbox.checked;
});

encryptButton.addEventListener('click', () => {
  if (matrix === null || !util.testMatrix(matrix)) {
    return;
  }

  const message: string = plainElement.value;
  const encryptedMessage: string = encrypt(message, matrix, useRotation);
  encryptedElement.value = encryptedMessage;
});

decryptButton.addEventListener('click', () => {
  if (matrix === null || !util.testMatrix(matrix)) {
    return;
  }

  const encryptedMessage: string = encryptedElement.value;
  const decryptedMessage: string = decrypt(encryptedMessage, matrix, useRotation);
  plainElement.value = decryptedMessage;
});
