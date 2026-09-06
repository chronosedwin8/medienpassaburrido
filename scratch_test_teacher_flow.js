const fs = require('fs');

async function testTeacherFlow() {
    console.log('--- STARTING TEACHER FLOW TESTS ---');

    // 1. Login as teacher
    const loginParams = new URLSearchParams();
    loginParams.append('email', 'mcabarcas@colegioaleman.edu.co');
    loginParams.append('password', '1001995102');

    const loginRes = await fetch('http://localhost:3000/teacher/login', {
        method: 'POST',
        body: loginParams,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        redirect: 'manual'
    });

    console.log('Teacher Login Response Status:', loginRes.status);
    const setCookieHeader = loginRes.headers.get('set-cookie');
    console.log('Cookies received:', setCookieHeader);

    if (!setCookieHeader) {
        console.error('Teacher login failed!');
        return;
    }

    // Parse cookies
    const cookie = setCookieHeader.split(',').map(c => c.split(';')[0]).join('; ');
    console.log('Teacher Cookie String:', cookie);

    // 2. Fetch /teacher/student-preview
    console.log('\nFetching student-preview...');
    const previewRes = await fetch('http://localhost:3000/teacher/student-preview', {
        headers: { 'Cookie': cookie }
    });
    console.log('Preview Status:', previewRes.status);
    const previewHtml = await previewRes.text();
    // Check if Teacher Agent config form exists in the preview page
    const hasConfigForm = previewHtml.includes('agente') || previewHtml.includes('teacher-agent') || previewHtml.includes('challenge-tools');
    console.log('Preview contains Teacher Agent controls:', hasConfigForm);

    // 3. Post to /api/teacher/challenge-tools
    console.log('\nSaving challenge tools config via API...');
    const toolsParams = new URLSearchParams();
    toolsParams.append('grade', '4');
    toolsParams.append('subject', 'aleman');
    toolsParams.append('challenge', 'reto1_aleman');
    toolsParams.append('description', 'En este reto usaremos Canva para diseñar un folleto digital explicativo.');

    const saveRes = await fetch('http://localhost:3000/api/teacher/challenge-tools', {
        method: 'POST',
        body: toolsParams,
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookie
        }
    });
    console.log('API Save Response Status:', saveRes.status);
    const saveResult = await saveRes.json();
    console.log('API Save Result JSON:', saveResult);

    // 4. Verify local config file
    const configPath = './data/challenge_tools_config.json';
    if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf8');
        console.log('Config File Content:', configContent);
    } else {
        console.error('Config file challenge_tools_config.json does not exist!');
    }

    console.log('--- TEACHER FLOW TESTS FINISHED ---');
}

testTeacherFlow().catch(console.error);
