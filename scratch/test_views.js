const http = require('http');

function fetchWithCookie(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET',
            headers: {
                'Cookie': 'teacher_auth=true; teacher_data=' + encodeURIComponent(JSON.stringify({
                    email: 'lacero@colegioaleman.edu.co',
                    first_name: 'Profesor',
                    last_name: 'Test',
                    subject: 'aleman'
                }))
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.end();
    });
}

async function runTests() {
    console.log('Starting verification of teacher views...');
    
    try {
        // 1. Test training page
        console.log('\n--- 1. Testing /teacher/training ---');
        const trainingRes = await fetchWithCookie('/teacher/training');
        console.log(`Status Code: ${trainingRes.statusCode}`);
        if (trainingRes.statusCode === 200) {
            console.log('✓ Request succeeded');
            // Check for new headers / merged accordions title
            const hasTitlePart1 = trainingRes.body.includes('Comprendiendo las competencias KMK');
            const hasTitlePart2 = trainingRes.body.includes('Ejemplos prácticos parte II Competencias en acci');
            console.log(`Has Part 1 title: ${hasTitlePart1}`);
            console.log(`Has Part 2 title: ${hasTitlePart2}`);
            if (hasTitlePart1 && hasTitlePart2) {
                console.log('✓ Part I and Part II titles and consolidation are rendered correctly.');
            } else {
                console.error('✗ Titles missing or modified incorrectly.');
            }
        } else {
            console.error(`✗ Failed to load /teacher/training, got ${trainingRes.statusCode}`);
        }

        // 2. Test progress page
        console.log('\n--- 2. Testing /teacher/progress ---');
        const progressRes = await fetchWithCookie('/teacher/progress');
        console.log(`Status Code: ${progressRes.statusCode}`);
        if (progressRes.statusCode === 200) {
            console.log('✓ Request succeeded');
            const hasKlasse12Option = progressRes.body.includes('Klasse 12');
            const hasLimitFunction = progressRes.body.includes('getStudentGradeLevel');
            console.log(`Has Klasse 12 selector option: ${hasKlasse12Option}`);
            console.log(`Has getStudentGradeLevel: ${hasLimitFunction}`);
            if (hasKlasse12Option && hasLimitFunction) {
                console.log('✓ Progress selectors and function are active up to Klasse 12.');
            } else {
                console.error('✗ Selectors or function missing.');
            }
        } else {
            console.error(`✗ Failed to load /teacher/progress, got ${progressRes.statusCode}`);
        }

        // 3. Test student preview page
        console.log('\n--- 3. Testing /teacher/student-preview ---');
        const previewRes = await fetchWithCookie('/teacher/student-preview');
        console.log(`Status Code: ${previewRes.statusCode}`);
        if (previewRes.statusCode === 200) {
            console.log('✓ Request succeeded');
            // Check for Klasse 12 tab configuration
            const hasK12Tab = previewRes.body.includes('12: { title: "Klasse 12", desc: "Avanzado + 6" }');
            // Check for options rendering in student-preview
            const hasOptionsCode = previewRes.body.includes('q.options && q.options.length > 0');
            console.log(`Has Klasse 12 configuration in preview: ${hasK12Tab}`);
            console.log(`Has option/radio buttons layout in preview: ${hasOptionsCode}`);
            if (hasK12Tab && hasOptionsCode) {
                console.log('✓ Student simulation controls successfully updated.');
            } else {
                console.error('✗ Simulation config missing.');
            }
        } else {
            console.error(`✗ Failed to load /teacher/student-preview, got ${previewRes.statusCode}`);
        }

        // 4. Test download-challenges print page
        console.log('\n--- 4. Testing /teacher/download-challenges ---');
        const printRes = await fetchWithCookie('/teacher/download-challenges?level=5&lang=es');
        console.log(`Status Code: ${printRes.statusCode}`);
        if (printRes.statusCode === 200) {
            console.log('✓ Request succeeded');
            const hasCheckboxBoxClass = printRes.body.includes('checkbox-box');
            const hasPrintOptionsLoop = printRes.body.includes('print-options');
            console.log(`Has checkbox-box CSS: ${hasCheckboxBoxClass}`);
            console.log(`Has print-options element loop: ${hasPrintOptionsLoop}`);
            if (hasCheckboxBoxClass && hasPrintOptionsLoop) {
                console.log('✓ Printable challenges booklet successfully formatted with multiple-choice boxes [ ].');
            } else {
                console.error('✗ Booklet format missing checkbox options.');
            }
        } else {
            console.error(`✗ Failed to load /teacher/download-challenges, got ${printRes.statusCode}`);
        }

    } catch (e) {
        console.error('Exception during verification requests:', e);
    }
}

runTests();
