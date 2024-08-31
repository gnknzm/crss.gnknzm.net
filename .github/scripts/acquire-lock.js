
const cp = require('child_process');
const crypto = require('crypto');

function configureGit() {
    cp.execSync('git config --global user.email "41898282+github-actions[bot]@users.noreply.github.com"');
    cp.execSync('git config --global user.name "github-actions[bot]"');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

configureGit();

(async () => {
    while (true) {
        try {
            cp.execSync('git branch -D workflow-lock || true');
            cp.execSync('git checkout -b workflow-lock');
            cp.execSync('git', ['commit', '--allow-empty', '-m', 'Acquire lock ' + crypto.randomUUID()]);
            cp.execSync('git push -u origin workflow-lock');
            console.log("Acquired lock!");
            break;
        } catch (e) {
            console.log("Failed to acquire lock, retrying in 5 seconds");
            await sleep(5000);
            continue;
        }
    }
})();