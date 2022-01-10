const cp = require('child_process');
const fs = require('fs');
const path = require('path');

cp.execSync('tsc --module amd', { stdio: 'inherit' });

for (const fileName of fs.readdirSync('./public')) {
  fs.copyFileSync(path.join('public', fileName), path.join('dist', fileName));
}
