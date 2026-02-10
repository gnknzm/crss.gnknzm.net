
const fs = require('fs');
const cp = require('child_process');
const github = import('@actions/github');

const INITIAL_ID = {
    "2024": 36000,
    "2025": 47000,
    "2026": 58000
};

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
const owner = process.env.GITHUB_REPOSITORY_OWNER;
const repo = process.env.GITHUB_REPOSITORY.split('/')[1];
const issue = JSON.parse(process.env.ISSUE_PAYLOAD);
const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

try {
    configureGit();
    checkoutBranch('database');
    const japanYear = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric'
    });
    const files = fs.readdirSync('.').filter(file => file.endsWith('.json'));
    const yearFilesCount = files.filter(file => file.startsWith(`CRE-${japanYear}-`)).length;
    const id = `CRE-${japanYear}-${INITIAL_ID[japanYear] + yearFilesCount}`;
    const body = JSON.parse(issue.body);
    if (!body.author || !body.text || !body.vector_string) {
        throw new Error('Invalid issue body');
    }
    body.id = id;
    fs.writeFileSync(`${id}.json`, JSON.stringify(body, null, 2));
    console.log(`Wrote issue to ${id}.json`);
    commit();
    files.push(`${id}.json`);
    const all = files.map(file => JSON.parse(fs.readFileSync(file)));
    checkoutBranch('generated');
    fs.writeFileSync('all.json', JSON.stringify(all, null, 2));
    commit();
    push();
    octokit.rest.issues.createComment({
        issue_number: issue.number,
        owner: owner,
        repo: repo,
        body: `Registered oyajigyagu with ID [${id}](https://crss.gnknzm.net/details/?id=${id})`
    });
    octokit.rest.issues.update({
        issue_number: issue.number,
        owner: owner,
        repo: repo,
        state: 'closed'
    });
} catch (e) {
    octokit.rest.issues.createComment({
        issue_number: issue.number,
        owner: owner,
        repo: repo,
        body: `Skipping issue due to the invalid body.`
    });
    console.log(e);
}
checkoutBranch('master');
