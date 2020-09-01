const { writeFileSync, mkdirSync, copyFileSync } = require('fs');
const pack = require('../package.json');

delete pack.scripts;
delete pack.devDependencies;
delete pack.jest;

// see if bin exists
try {
    mkdirSync('./bin');
} catch (error) {
    // can be ignored
}
writeFileSync('./bin/package.json', JSON.stringify(pack, null, 4));

copyFileSync('./README.md', './bin/README.md');
copyFileSync('./LICENSE', './bin/LICENSE');
