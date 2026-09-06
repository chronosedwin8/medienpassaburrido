const http = require('http');

function checkPage(path) {
    return new Promise((resolve) => {
        http.get(`http://localhost:3000${path}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const count = (data.match(/\/docs/g) || []).length;
                console.log(`URL ${path}: /docs appears ${count} times.`);
                resolve();
            });
        });
    });
}

async function run() {
    await checkPage('/login');
    await checkPage('/teacher/login');
}
run();
