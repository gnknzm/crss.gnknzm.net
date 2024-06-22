
const fs = require('fs');
const cp = require('child_process');

function configureGit() {
    cp.execSync('git config --global user.email "41898282+github-actions[bot]@users.noreply.github.com"');
    cp.execSync('git config --global user.name "github-actions[bot]"');
}

function checkoutBranch(branch) {
    cp.execSync('git pull');
    try {
        cp.execFileSync('git', ['checkout', branch]);
    } catch (e) {
        cp.execFileSync('git', ['checkout', '-b', branch]);
        cp.execFileSync('git', ['push', '-u', 'origin', branch]);
    }
}

function commit() {
    cp.execSync('git add .');
    cp.execSync('git commit -m "Sync database"');
}

function push() {
    cp.execSync('git push --all');
}

try {
    configureGit();
    checkoutBranch('database');
    const files = fs.readdirSync('.').filter(file => file.endsWith('.json'));
    const all = files.map(file => JSON.parse(fs.readFileSync(file)));
    checkoutBranch('generated');
    fs.writeFileSync('all.json', JSON.stringify(all, null, 2));
    commit();
    push();
} catch (e) {
    console.log(e);
}
