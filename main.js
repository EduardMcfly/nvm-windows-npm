// rem see https://github.com/coreybutler/nvm-windows/issues/300
const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const { execSync } = require('child_process');

const files = [
  'npm',
  'npm.cmd',
  'npm.ps1',
  'npx',
  'npx.cmd',
  'npx.ps1',
  'node_modules\\npm',
];

yargs(hideBin(process.argv))
  .command('install <npm>', 'Install a npm version', {}, argv => {
    let npm = argv.npm;
    /**
     * @type {string[]}
     */
    const versions = JSON.parse(
      execSync(`npm view npm@${npm} version  --json`, {
        stdio: 'pipe',
      }).toString() || '[]'
    ).reverse();
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
      files.forEach(file => {
        const filePath = `${nodePath}\\${file}`;
        const filePathBackup = `${filePath}-old`;
        if (fs.existsSync(filePath)) {
          if (fs.existsSync(filePathBackup))
            fs.rmSync(filePathBackup, { recursive: true, force: true });
          fs.renameSync(filePath, `${filePath}-old`);
        }
      });
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
      console.log('Error');
      files.forEach(file => {
        const filePath = `${nodePath}\\${file}-old`;
        if (fs.existsSync(filePath))
          fs.renameSync(filePath, `${nodePath}\\${file}`);
      });
    }
  })
  .demandCommand(1)
  .parse();
