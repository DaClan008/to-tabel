/* eslint-disable no-console */
const { execSync } = require('child_process');
const { writeFileSync } = require("fs");
const { join, resolve, sep } = require('path');

const options = { cwd: join(process.cwd(), '/bin') }

const args = process.argv.slice(2);
let ignoreGit = false;
let ignorePack = false;
let message;
let ver = 'patch';
if (args.length > 0) {
    for (let i = 0, len = args.length; i < len; i++) {
        const val = args[i].replace(/^-+/, '').toLowerCase();
        switch (val) {
            case 'p':
                ver = 'patch';
                break;
            case 'm':
                ver = 'minor';
                break;
            case 'M':
                ver = 'major';
                break;
            case 'patch':
            case 'major':
            case 'minor':
            case 'premajor':
            case 'preminor':
            case 'prepatch':
            case 'from-git':
            case 'prerelease':
                ver = val;
                break;
            case 'preid':
                if (len > i + 1) {
                    const next = args[i + 1];
                    if (ver !== '') ver += ' '
                    ver += `--preid=${next}`;
                    i++;
                }
                break;
            case 'mes':
            case 'message':
                message = `-m "${args[i + 1]}"`;
                i++
                break;
            case 'ignorepack':
                ignorePack = true;
                break;
            case 'ignoregit':
                ignoreGit = true;
            default:
                if (/^\d+\.\d+\.\d+/.test(val)) ver = val;
                else if (/(--)?preid=.+/.test(val)) ver += `${ver !== '' ? ' ' : ''}--${val}`;
                else if (/mes(sage)?=('|")?.*('|")?/.test(val)) [, message] = val.split('=');
                break;
        }
    }
}

function getVersion(dest) {
    // eslint-disable-next-line
    const pack = require(join(dest, 'package.json'));
    if (!pack) throw new Error(`can't find package.json file inside ${dest}`);
    return pack.version;
}

function updateVersion() {
    const folder = resolve('./bin');
    const currVersion = getVersion(resolve('./bin'));
    let newVersion = '';
    if (!currVersion) throw new Error(`Unable to get version on ${folder}${sep}package.json`);
    if (ver) {
        const stdout = execSync(`npm version ${ver}`, options);
        console.log(stdout.toString());
        if (/^v/.test(stdout.toString())) {
            newVersion = stdout.toString().replace(/^v/, '').trim();
        }
        if (newVersion === currVersion) throw new Error(`Version was not updated`);
        console.log(`version was updated from ${currVersion} to ${newVersion}`);
        return newVersion;
    }
    return undefined;
}

function publish() {
    const stdout = execSync('npm publish', options);
    console.log(stdout.toString());
    console.log('published');
}

function updatePackage(version) {
    const file = resolve('package.json');
    // eslint-disable-next-line
    const pack = require(file);
    if (!pack) return false;
    pack.version = version;
    writeFileSync(file, JSON.stringify(pack, null, 4));
    return true;
}

function git(version) {
    if (ignoreGit) return false;
    if (!message) message = `-m "updating version to ${version}"`;
    execSync(`git tag -a v${version} ${message}`);
    console.info(`git package version updated: ${version}`)
    return true;
}

function run() {
    console.info("start publishing");
    if (ignorePack) return console.info("Package not published.");
    const newVer = updateVersion();
    if (!newVer) return console.info('exiting publish');
    publish();
    if (!updatePackage(newVer)) return console.info(`Package.json version has not been updated to ${newVer}`);
    if (!git(newVer)) return console.info(`git version was not updated to ${newVer}`);
    console.info('Publish completed succesfully');
    return undefined;
}

run();

