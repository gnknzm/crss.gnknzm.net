
const cp = require('child_process');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    while (true) {
        try {
            cp.execFileSync('git', ['push', 'origin', '--delete', 'workflow-lock']);
            console.log("Released lock!");
            break;
        } catch (e) {
            console.log("Failed to release lock, retrying in 5 seconds");
            await sleep(5000);
            continue;
        }
    }
})();