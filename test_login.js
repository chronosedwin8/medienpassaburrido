const body = new URLSearchParams();
body.append('username', 'gabriel');
body.append('class_name', '5D');
body.append('student_code', '2972');

fetch('http://localhost:3000/login', {
  method: 'POST',
  body: body,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  redirect: 'manual'
}).then(async (r) => {
    console.log(r.status, r.url);
    if(r.status === 200) {
        const html = await r.text();
        const match = html.match(/class=\"error-alert\"[^>]*>([\s\S]*?)<\/div>/);
        console.log(match ? match[1].trim() : 'No error found in HTML');
    }
});
