const cp = require('child_process');
const fs = require('fs');
const path = require('path');

cp.execSync('wasm-pack build --target web', { cwd: './logic' });

fs.mkdirSync(path.join('dist', 'logic', 'pkg'), { recursive: true });
for (const fileName of fs.readdirSync(path.join('logic', 'pkg'))) {
  fs.copyFileSync(path.join('logic', 'pkg', fileName), path.join('dist', 'logic', 'pkg', fileName));
}

cp.execSync('tsc');

for (const fileName of fs.readdirSync('./interface/public')) {
  fs.copyFileSync(path.join('./interface/public', fileName), path.join('dist', fileName));
}
