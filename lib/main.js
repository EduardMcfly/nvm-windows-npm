// rem see https://github.com/coreybutler/nvm-windows/issues/300
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const { install } = require('./commands/install');
const { getVersions } = require('./utils');

const args = hideBin(process.argv);
const commands = yargs(args)
  .version(false)
  .command('install <version>', 'Install a npm version', {}, install)
  .command(
    'list',
    'List available npm versions',
    {
      version: {
        alias: 'v',
        describe: 'npm package name',
        demandOption: false,
      },
    },
    argv => {
      const versions = getVersions(argv.version);
      console.log(versions);
    }
  )
  .strict(true);

if (!args.length) commands.showHelp();
commands.parseSync();
