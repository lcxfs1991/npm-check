'use strict';
const _ = require('lodash');
const path = require('path');
const globalModulesPath = require('global-modules');
const readPackageJson = require('../in/read-package-json');
const globalPackages = require('../in/get-installed-packages');
const emoji = require('../out/emoji');
const fs = require('fs');
const chalk = require('chalk');

function init(currentState, userOptions) {
    return new Promise((resolve, reject) => {
        _.each(userOptions, (value, key) => currentState.set(key, value));

        if (currentState.get('global')) {

            if (process.env.NODE_PATH && !fs.existsSync(process.env.NODE_PATH)) {
                throw new Error('process.env.NODE_PATH does not exist. Please check the environment variables.');
            }

            const modulesPath = process.env.NODE_PATH || globalModulesPath;

            console.log(chalk.green('The global path you are searching is: ' + modulesPath));

            currentState.set('cwd', globalModulesPath);
            currentState.set('nodeModulesPath', globalModulesPath);
            currentState.set('globalPackages', globalPackages(modulesPath));
        } else {
            const cwd = path.resolve(currentState.get('cwd'));
            const pkg = readPackageJson(path.join(cwd, 'package.json'));
            currentState.set('cwdPackageJson', pkg);
            currentState.set('cwd', cwd);
            currentState.set('nodeModulesPath', path.join(cwd, 'node_modules'));
        }

        emoji.enabled(currentState.get('emoji'));

        if (currentState.get('cwdPackageJson').error) {
            return reject(currentState.get('cwdPackageJson').error);
        }

        return resolve(currentState);
    });
}

module.exports = init;
