async function testGrade4() {
    console.log('--- STARTING GRADE 4 FLOW TESTS ---');

    // 1. Login as student
    const loginParams = new URLSearchParams();
    loginParams.append('username', '3144');
    loginParams.append('class_name', 'K4A');
    loginParams.append('student_code', '3144');

    const loginRes = await fetch('http://localhost:3000/login', {
        method: 'POST',
        body: loginParams,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        redirect: 'manual'
    });

    console.log('Login Response Status:', loginRes.status);
    const setCookieHeader = loginRes.headers.get('set-cookie');
    if (!setCookieHeader) {
        console.error('Login failed!');
        return;
    }

    const cookie = setCookieHeader.split(',').map(c => c.split(';')[0]).join('; ');

    // 2. Fetch Dashboard
    console.log('\nFetching Dashboard...');
    const dashRes = await fetch('http://localhost:3000/?level=4', {
        headers: { 'Cookie': cookie }
    });
    console.log('Dashboard Status:', dashRes.status);
    const dashHtml = await dashRes.text();

    // Check if "tecnologia" is present in subjects filter bar
    const hasTecnologiaPill = dashHtml.includes('data-subject="tecnologia"');
    console.log('Dashboard contains Tecnología filter pill:', hasTecnologiaPill);

    // Check if tech_heroes activity card is present
    const hasTechHeroes = dashHtml.includes('id="card-tech_heroes"');
    console.log('Dashboard contains "tech_heroes" activity card:', hasTechHeroes);

    // Check if reto1_tecnologia is present
    const hasReto1Tec = dashHtml.includes('id="card-reto1_tecnologia"');
    console.log('Dashboard contains "reto1_tecnologia" activity card:', hasReto1Tec);

    // Fetch reto1_tecnologia page
    console.log('\nFetching /tecnologia/reto1_tecnologia...');
    const actRes = await fetch('http://localhost:3000/tecnologia/reto1_tecnologia', {
        headers: { 'Cookie': cookie }
    });
    console.log('Activity Page Status:', actRes.status);
    const actHtml = await actRes.text();
    const hasTitle = actHtml.includes('Reto 1 - Tecnología');
    console.log('Activity page has correct title:', hasTitle);

    console.log('--- GRADE 4 FLOW TESTS FINISHED ---');
}

testGrade4().catch(console.error);
