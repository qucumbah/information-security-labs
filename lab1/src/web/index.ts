import * as util from '../common/util';
import Matrix from '../common/Matrix';

// const plain = document.querySelector('#plain') as HTMLElement;
// const encrypted = document.querySelector('#encrypted') as HTMLElement;
const matrix = document.querySelector('#matrix') as HTMLElement;

const invalidMatrixWarning = document.querySelector('#invalidMatrixWarning') as HTMLElement;

// const encrypt = document.querySelector('#encrypt') as HTMLElement;
// const decrypt = document.querySelector('#decrypt') as HTMLElement;

matrix.textContent = '# ##\n ###\n# ##\n### ';

matrix.addEventListener('input', () => {
  const matrixString: string = matrix.textContent!;
  const mat: Matrix = util.readMatrix(matrixString);
  invalidMatrixWarning.style.display = util.testMatrix(mat) ? 'block' : 'none';
});
