const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'views', 'teacher', 'progress.ejs');
console.log('Reading from:', targetFile);

let content = fs.readFileSync(targetFile, 'utf8');

// 1. Add sidebar.css to the head
const headTarget = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">';
const headReplacement = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">\n    <link rel="stylesheet" href="/css/sidebar.css">\n    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">';

if (content.includes(headTarget)) {
    content = content.replace(headTarget, headReplacement);
    console.log('SUCCESS: Injected CSS in head');
} else {
    console.log('ERROR: headTarget not found!');
}

// 2. Replace body tag and header block with sidebar
const headerStart = '<body class="min-h-screen flex flex-col text-slate-800">';
const headerEnd = '</header>';

const bodyIdx = content.indexOf(headerStart);
const headerEndIdx = content.indexOf(headerEnd, bodyIdx);

if (bodyIdx !== -1 && headerEndIdx !== -1) {
    const pre = content.substring(0, bodyIdx);
    const post = content.substring(headerEndIdx + headerEnd.length);
    
    content = pre + `
<body class="min-h-screen flex flex-col text-slate-800">
    <%- include(\'../partials/sidebar\', { context: \'teacher\', activeItem: \'progress\' }) %>
` + post;
    console.log('SUCCESS: Replaced header with sidebar');
} else {
    console.log('ERROR: body/header elements not found!');
}

// 3. Update the Welcome Section to contain the download retos select & button
const welcomeStart = '<!-- Welcome & Filter Section -->';
const welcomeEnd = '<!-- Table Card -->';

const welcomeIdx = content.indexOf(welcomeStart);
const tableCardIdx = content.indexOf(welcomeEnd, welcomeIdx);

if (welcomeIdx !== -1 && tableCardIdx !== -1) {
    const pre = content.substring(0, welcomeIdx);
    const post = content.substring(tableCardIdx);
    
    const newWelcome = `<!-- Welcome & Filter Section -->
        <div class="glass-panel rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-l-4 border-l-blue-600">
            <div>
                <h3 class="text-2xl font-bold text-slate-900 mb-1">¡Hola, Profesor/a <%= teacher?.first_name || '' %>!</h3>
                <p class="text-slate-600 text-sm">Filtra por tu Klasse para visualizar en tiempo real el progreso y autoevaluación de tus estudiantes.</p>
            </div>
            <div class="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                <!-- Filter Klasse -->
                <div class="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-inner w-full sm:w-auto">
                    <span class="pl-2 text-slate-400">🔍</span>
                    <input type="text" id="classFilterInput" placeholder="Ej. 4A, 5B, 6C..." class="bg-transparent border-none focus:outline-none text-slate-800 font-medium px-2 py-1 w-24 placeholder:text-slate-400 uppercase">
                    <button onclick="fetchProgress()" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition shadow-md whitespace-nowrap">
                        Filtrar
                    </button>
                </div>
                <!-- Descargar Retos -->
                <div class="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-inner w-full sm:w-auto">
                    <span class="pl-2 text-slate-400">📄</span>
                    <select id="gradeSelectBooklet" class="bg-transparent text-slate-700 font-bold text-xs py-1 px-2 border-r border-slate-200 focus:outline-none uppercase">
                        <option value="2">Klasse 2</option>
                        <option value="3">Klasse 3</option>
                        <option value="4">Klasse 4</option>
                        <option value="5" selected>Klasse 5</option>
                        <option value="6">Klasse 6</option>
                        <option value="7">Klasse 7</option>
                        <option value="8">Klasse 8</option>
                        <option value="9">Klasse 9</option>
                        <option value="10">Klasse 10</option>
                        <option value="11">Klasse 11</option>
                        <option value="12">Klasse 12</option>
                    </select>
                    <button onclick="downloadBooklet()" class="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition shadow-md whitespace-nowrap">
                        Descargar Retos
                    </button>
                </div>
            </div>
        </div>
        
        `;
        
    content = pre + newWelcome + post;
    console.log('SUCCESS: Updated Welcome Section');
} else {
    console.log('ERROR: Welcome or Table Card markers not found!');
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('SUCCESS: All changes applied to progress.ejs!');
