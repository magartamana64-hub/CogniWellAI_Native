const { spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pythonCommand = process.env.PYTHON || 'python';
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function startProcess(command, args, name) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: false,
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.log(`${name} exited with code ${code}`);
    }
  });

  return child;
}

const api = startProcess(
  pythonCommand,
  [path.join(root, 'ai_engine', 'app.py')],
  'AI engine'
);

const expo = startProcess(
  npmCommand,
  ['run', 'expo:start'],
  'Expo'
);

function shutdown() {
  api.kill();
  expo.kill();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
