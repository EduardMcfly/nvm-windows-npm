const { execSync } = require('child_process');
const fs = require('fs');

const { files } = require('./constants');

const moveFiles = ({ nodePath, revert = false }) => {
  files.forEach(file => {
    const original = `${nodePath}\\${file}`;
    const directions = {
      [true]: original,
      [false]: `${original}-old`,
    };
    const origin = directions[!revert];
    const dir = directions[revert];
    if (fs.existsSync(origin)) {
      if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
      fs.renameSync(origin, dir);
    }
  });
};
exports.moveFiles = moveFiles;

const getVersions = version => {
  /**
   * @type {string[]}
   */

  let command;
  if (version) {
    command = `npm view npm@${version} version  --json`;
  } else {
    command = `npm view npm versions  --json`;
  }

  const versions = JSON.parse(
    execSync(command, {
      stdio: 'pipe',
    }).toString() || '[]'
  ).reverse();
  return versions;
};
exports.getVersions = getVersions;
