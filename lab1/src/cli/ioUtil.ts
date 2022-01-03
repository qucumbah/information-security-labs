import Matrix from '../common/Matrix';
import * as fs from 'fs';
import * as util from '../common/util';

export function readMatrixFromFile(filePath: string): Matrix {
  const fileContent: string = fs.readFileSync(filePath).toString();
  return util.readMatrix(fileContent);
}
