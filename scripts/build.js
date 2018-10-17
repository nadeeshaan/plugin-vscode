const { forEachSubModule, runNpmCommandSync, runGitCommand, modulesRoot } = require('./common');
runNpmCommandSync(["i"], modulesRoot);

const fs = require('fs');
const join = require('path').join;
const glob = require('glob');

const args = process.argv.slice(2);

forEachSubModule((modPath) => {
    process.stdout.write("==============================================================================\n");
    process.stdout.write(" Building - " + modPath + "\n");
    process.stdout.write("==============================================================================\n");

    runNpmCommandSync(["i"], modPath);
    runNpmCommandSync(["run", "build"], modPath);
    if (args[0] !== "--skipTest=true") {
        runNpmCommandSync(["run", "test"], modPath);
    }
    // Undo changes to package-lock files. These changes mostly happen
    // because of differences between npm versions
    runGitCommand(["checkout", "--", "package-lock.json"], modPath);
});

const extendedLangClientModPath =  join(modulesRoot, 'extended-language-client');
runNpmCommandSync(["pack", "."], extendedLangClientModPath);
glob(join(extendedLangClientModPath, '*.tgz'), (er, files) => {
    files.forEach(f => {
        fs.renameSync(f, join(extendedLangClientModPath, 'pack.tgz'));
    });
})