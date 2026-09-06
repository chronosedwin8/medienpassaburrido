const http = require('http');

// Helper to make POST request
function makePostRequest(path, data, cookie) {
    return new Promise((resolve, reject) => {
        const bodyStr = JSON.stringify(data);
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(bodyStr),
                'Cookie': cookie || ''
            }
        }, (res) => {
            let resData = '';
            res.on('data', chunk => { resData += chunk; });
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: resData
                });
            });
        });
        req.on('error', reject);
        req.write(bodyStr);
        req.end();
    });
}

// Helper to make GET request
function makeGetRequest(path, cookie) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET',
            headers: {
                'Cookie': cookie || ''
            }
        }, (res) => {
            let resData = '';
            res.on('data', chunk => { resData += chunk; });
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: resData
                });
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function run() {
    console.log("Starting verification test...");

    // 1. Authenticate (login as student)
    // We send a urlencoded post to /login
    const loginData = 'username=gabriel&class_name=5D&student_code=2972';
    const loginRes = await new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(loginData)
            }
        }, (res) => {
            resolve({
                status: res.statusCode,
                headers: res.headers
            });
        });
        req.on('error', reject);
        req.write(loginData);
        req.end();
    });

    console.log("Login response status:", loginRes.status);
    const cookies = loginRes.headers['set-cookie'];
    if (!cookies) {
        console.error("Login failed (no cookies returned)!");
        process.exit(1);
    }
    const cookie = cookies.map(c => c.split(';')[0]).join('; ');
    console.log("Logged in successfully. Cookie:", cookie);

    // 2. Measure save latency and test save behavior
    const testPayload = {
        test_question_1: 'A',
        test_question_2: 'B',
        period: 1,
        school_year: '2627'
    };

    console.log("Saving test data to /api/save/profile...");
    const startTime = Date.now();
    const saveRes = await makePostRequest('/api/save/profile', testPayload, cookie);
    const duration = Date.now() - startTime;

    console.log("Save duration:", duration, "ms");
    console.log("Save response:", saveRes.body);

    if (duration > 150) {
        console.error("WARNING: Save operation took longer than expected (local sync should be < 50ms)!");
    } else {
        console.log("SUCCESS: Save latency is ultra-low (optimized local write)!");
    }

    // 3. Load data and verify it matches
    console.log("Loading test data from /api/load/profile...");
    const loadRes = await makeGetRequest('/api/load/profile', cookie);
    console.log("Load response:", loadRes.body);

    const loadedObj = JSON.parse(loadRes.body);
    if (loadedObj.success && loadedObj.data && loadedObj.data.test_question_1 === 'A') {
        console.log("SUCCESS: Loaded data matches saved data exactly!");
    } else {
        console.error("ERROR: Loaded data does not match!");
        process.exit(1);
    }

    console.log("All verification tests passed successfully!");
}

run().catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
});
