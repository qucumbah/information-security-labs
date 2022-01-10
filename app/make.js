const cp = require('child_process');
const fse = require('fs-extra');
const path = require('path');

// This script is supposed to be run from the root of the repo

const appDistDir = path.join('app', 'dist');
if (fse.existsSync(appDistDir)) {
  fse.rmSync(appDistDir, { recursive: true });
}
fse.mkdirSync(appDistDir);

const labFolders = fse.readdirSync('./').filter((folder) => folder.startsWith('lab'));
for (const labFolder of labFolders) {
  cp.execSync('npm install', { cwd: labFolder, stdio: 'inherit' });
  cp.execSync('npm run build', { cwd: labFolder, stdio: 'inherit' });
  fse.copySync(path.join(labFolder, 'dist'), path.join(appDistDir, labFolder));
}

fse.copySync(path.join('app', 'index.html'), path.join(appDistDir, 'index.html'));

// Wasm-pack emits .gitignore file with '*' content, so no wasm content is pushed to the gh_pages branch
// This breaks Github Pages publish, so we have to remove these .gitignores
const allFiles = getAllFiles(appDistDir);
for (const file of allFiles) {
  if (file.endsWith('.gitignore')) {
    fse.rmSync(file);
  }
}

function getAllFiles(dirOrFile) {
  if (fse.statSync(dirOrFile).isFile()) {
    return [dirOrFile];
  }
  const dirChildren = fse.readdirSync(dirOrFile);
  return dirChildren.map((child) => getAllFiles(path.join(dirOrFile, child))).flat();
}

console.log(getAllFiles(appDistDir));
