const cp = require('child_process');
const fse = require('fs-extra');
const path = require('path');

const appDistDir = path.join('app', 'dist');
if (fse.existsSync(appDistDir)) {
  fse.rmSync(appDistDir, { recursive: true });
}
fse.mkdirSync(appDistDir);

// This is supposed to be run from the root of the repo
const labFolders = fse.readdirSync('./').filter((folder) => folder.startsWith('lab'));
for (const labFolder of labFolders) {
  cp.execSync('npm run build', { cwd: labFolder, stdio: 'inherit' });
  fse.copySync(path.join(labFolder, 'dist'), path.join(appDistDir, labFolder));
}

fse.copySync(path.join('app', 'index.html'), path.join(appDistDir, 'index.html'));
