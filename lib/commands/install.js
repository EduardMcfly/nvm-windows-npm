const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { files } = require('../constants');
const { moveFiles, getVersions } = require('../utils');

const install = argv => {
  let npm = argv.version;
  /**
   * @type {string[]}
   */
  const versions = getVersions(npm);
  const version = versions.find(a => a.match(argv.npm)) || versions[0];
  if (!version) {
    console.error(`No version found for ${npm}`);
    return;
  }
  if (version === 'latest') {
    console.log('Downloading latest version of npm...');
    version = execSync('npm show npm version').toString().trim();
  }
  const currentVersion = execSync('npm -g -v').toString().trim();
  if (version === currentVersion) {
    console.log('Already installed');
    return;
  }
  console.log('New version', version);
  console.log(`Updating...`);
  const PROGRAMFILES = process.env['PROGRAMFILES'];
  const nodePath = `${PROGRAMFILES}\\nodejs`;

  try {
    moveFiles({ nodePath, revert: false });
    const npmBindir = path.join(nodePath, `node_modules/npm-old/bin`);
    execSync(`node npm-cli.js i npm@${version} -g`, {
      cwd: npmBindir,
      stdio: 'inherit',
    });
    files.forEach(file => {
      const filePath = `${nodePath}\\${file}-old`;
      if (fs.existsSync(filePath))
        fs.rmSync(filePath, { recursive: true, force: true });
    });
    const newVersion = execSync('npm -g -v').toString().trim();
    console.log('\nNew version', newVersion);
  } catch (error) {
    console.log('Error', error.message);
    moveFiles({ nodePath, revert: true });
  }
};

exports.install = install;
