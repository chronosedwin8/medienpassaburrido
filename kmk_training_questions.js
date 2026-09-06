/**
 * kmk_training_questions.js
 * Banco de preguntas para la Capacitación KMK x Docente
 * 25 preguntas — 5 por cada categoría
 * Deutsche Schule Barranquilla — MedienPass
 */

const kmkTrainingQuestions = [

  // ════════════════════════════════════════
  // 📚 CATEGORÍA 1: Fundamentos KMK (5 preguntas)
  // ════════════════════════════════════════
  {
    id: 'kmk_01',
    category: 'fundamentos',
    categoryLabel: '📚 Fundamentos KMK',
    question: '¿Qué significan las siglas KMK en el contexto de la educación digital alemana?',
    options: [
      'Kultusministerkonferenz — Conferencia permanente de Ministros de Educación y Asuntos Culturales de los estados alemanes',
      'Kompetenzen Medialer Kultur — Competencias de Cultura Mediática',
      'Kreativität, Medien und Kommunikation — Creatividad, Medios y Comunicación',
      'Keine Medien Kontrolle — Sin Control de Medios'
    ],
    correct: 0,
    explanation: 'KMK es la Kultusministerkonferenz, el organismo que estableció el marco de competencias digitales para la educación alemana (Bildung in der digitalen Welt, 2016). Define 6 áreas de competencia para el uso responsable de medios digitales.',
    difficulty: 'basico'
  },
  {
    id: 'kmk_02',
    category: 'fundamentos',
    categoryLabel: '📚 Fundamentos KMK',
    question: '¿Cuántas competencias principales contempla el marco KMK de educación digital?',
    options: [
      '3 competencias: Buscar, Comunicar y Producir',
      '6 competencias: Buscar/Procesar, Comunicar/Colaborar, Producir, Schützen/Sicher agieren, Problemlösen, Analysieren/Reflektieren',
      '4 competencias: Digital, Mediático, Crítico e Informacional',
      '8 competencias según el marco europeo DigComp'
    ],
    correct: 1,
    explanation: 'El marco KMK define 6 áreas: 1) Suchen, Verarbeiten, Aufbewahren; 2) Kommunizieren und Kooperieren; 3) Produzieren und Präsentieren; 4) Schützen und sicher Agieren; 5) Problemlösen und Handeln; 6) Analysieren und Reflektieren.',
    difficulty: 'basico'
  },
  {
    id: 'kmk_03',
    category: 'fundamentos',
    categoryLabel: '📚 Fundamentos KMK',
    question: '¿Cuál es el principal objetivo del MEDIENPASS en el colegio alemán?',
    options: [
      'Certificar que los estudiantes saben usar redes sociales de manera entretenida',
      'Documentar y desarrollar progresivamente las competencias mediáticas de los estudiantes a lo largo de su escolaridad',
      'Reemplazar los libros de texto por tablets en todas las asignaturas',
      'Calificar numéricamente el rendimiento digital de cada estudiante'
    ],
    correct: 1,
    explanation: 'El MedienPass es un instrumento de documentación y desarrollo progresivo. Permite al estudiante registrar sus avances en competencias digitales según el marco KMK, sirviendo como portafolio de evidencias a lo largo de su escolaridad.',
    difficulty: 'basico'
  },
  {
    id: 'kmk_04',
    category: 'fundamentos',
    categoryLabel: '📚 Fundamentos KMK',
    question: 'En el contexto del MedienPass, ¿qué es un "Reto" (Herausforderung)?',
    options: [
      'Un examen evaluativo que determina si el estudiante puede avanzar de nivel',
      'Una actividad de aprendizaje situado que desarrolla una o varias competencias KMK dentro de una asignatura específica',
      'Un proyecto de clase que dura todo el año escolar',
      'Una prueba estandarizada de conocimientos digitales aplicada a nivel nacional'
    ],
    correct: 1,
    explanation: 'Un Reto en el MedienPass es una actividad de aprendizaje auténtica, contextualizada dentro de una asignatura, que permite al estudiante desarrollar y evidenciar competencias KMK específicas. No es una evaluación sumativa sino formativa.',
    difficulty: 'intermedio'
  },
  {
    id: 'kmk_05',
    category: 'fundamentos',
    categoryLabel: '📚 Fundamentos KMK',
    question: 'Un docente integra el MedienPass correctamente cuando:',
    options: [
      'Pide a los estudiantes buscar información en Google y copiarla en un documento Word',
      'Diseña actividades que articulan los contenidos curriculares con el desarrollo explícito de competencias mediáticas KMK, generando evidencias en ClassNotebook',
      'Asigna ver videos de YouTube como tarea complementaria sin reflexión posterior',
      'Utiliza el proyector del salón para mostrar presentaciones elaboradas solo por el docente'
    ],
    correct: 1,
    explanation: 'La integración correcta implica articulación curriculo-competencias KMK, donde el estudiante es el productor activo de evidencias digitales, y estas quedan documentadas en herramientas como ClassNotebook dentro del ecosistema Microsoft 365.',
    difficulty: 'intermedio'
  },

  // ════════════════════════════════════════
  // 🔍 CATEGORÍA 2: Búsqueda y análisis de información (5 preguntas)
  // ════════════════════════════════════════
  {
    id: 'kmk_06',
    category: 'busqueda',
    categoryLabel: '🔍 Búsqueda y Análisis de Información',
    question: '¿Cuál es la diferencia entre una fuente primaria y una fuente secundaria en la investigación digital?',
    options: [
      'Las fuentes primarias son gratuitas; las secundarias son de pago',
      'Las fuentes primarias provienen directamente del autor o evento original; las secundarias son interpretaciones o resúmenes de esas fuentes',
      'Las fuentes primarias solo existen en papel; las secundarias solo en formato digital',
      'No existe diferencia relevante para el trabajo en el aula'
    ],
    correct: 1,
    explanation: 'Una fuente primaria es el documento original (artículo científico, discurso, obra de arte). Una fuente secundaria lo analiza o interpreta (artículo de opinión, enciclopedia, resumen). En educación digital es clave enseñar a los estudiantes a identificar y citar correctamente cada tipo.',
    difficulty: 'basico'
  },
  {
    id: 'kmk_07',
    category: 'busqueda',
    categoryLabel: '🔍 Búsqueda y Análisis de Información',
    question: 'Un estudiante encuentra un artículo viral en redes sociales sobre un tema científico. ¿Cuál es la estrategia más adecuada para evaluar su confiabilidad?',
    options: [
      'Si tiene muchos "likes" y compartidos, entonces es confiable',
      'Verificar el autor, fecha de publicación, fuentes citadas y contrastar con al menos 2 fuentes adicionales de instituciones reconocidas',
      'Copiar el enlace en WhatsApp y preguntar a los compañeros si lo conocen',
      'Confiar en el artículo si aparece en los primeros resultados de Google'
    ],
    correct: 1,
    explanation: 'La verificación requiere SIFT: Stop (detenerse antes de compartir), Investigate the source (investigar la fuente), Find better coverage (buscar cobertura adicional), Trace claims (rastrear afirmaciones hasta su origen). El número de likes no indica fiabilidad.',
    difficulty: 'intermedio'
  },
  {
    id: 'kmk_08',
    category: 'busqueda',
    categoryLabel: '🔍 Búsqueda y Análisis de Información',
    question: '¿Qué técnica de búsqueda avanzada en Google permite encontrar resultados SOLO dentro de un sitio web específico?',
    options: [
      'Usar comillas alrededor de la palabra: "sitio"',
      'Usar el operador site: seguido del dominio — ejemplo: site:bbc.com cambio climático',
      'Escribir el nombre del sitio en mayúsculas antes del término de búsqueda',
      'Activar la búsqueda segura en los ajustes de Google'
    ],
    correct: 1,
    explanation: 'El operador site: es uno de los más útiles en Google. Ejemplos: site:edu.co coronavirus (solo sitios educativos colombianos), site:gov.de (solo sitios gubernamentales alemanes). También se pueden combinar operadores: site:scielo.org "inteligencia artificial" filetype:pdf',
    difficulty: 'intermedio'
  },
  {
    id: 'kmk_09',
    category: 'busqueda',
    categoryLabel: '🔍 Búsqueda y Análisis de Información',
    question: '¿Qué es el "sesgo de confirmación" y cómo afecta la búsqueda de información digital?',
    options: [
      'Es un error técnico de los buscadores que muestra resultados repetidos',
      'Es la tendencia de buscar, interpretar y recordar solo la información que confirma nuestras creencias previas, ignorando evidencia contraria',
      'Es cuando el algoritmo de Google personaliza los resultados según el historial del usuario',
      'Es un tipo de virus informático que altera los resultados de búsqueda'
    ],
    correct: 1,
    explanation: 'El sesgo de confirmación lleva a los estudiantes (y adultos) a encontrar solo lo que quieren encontrar. Como docentes, es importante diseñar actividades que requieran buscar y analizar múltiples perspectivas, incluyendo fuentes que cuestionen la hipótesis inicial.',
    difficulty: 'avanzado'
  },
  {
    id: 'kmk_10',
    category: 'busqueda',
    categoryLabel: '🔍 Búsqueda y Análisis de Información',
    question: 'Para una actividad de investigación en clase, ¿cuál de estos recursos es más apropiado para encontrar artículos científicos revisados por pares?',
    options: [
      'Wikipedia, porque cualquiera puede editarla y agregar fuentes',
      'Google Scholar, JSTOR, Scielo o bases de datos académicas institucionales',
      'YouTube Educational, porque los videos son más fáciles de entender',
      'Los primeros 5 resultados de una búsqueda normal en Google'
    ],
    correct: 1,
    explanation: 'Google Scholar, JSTOR, Scielo, ERIC (educación) y PubMed (salud) ofrecen contenido revisado por pares (peer-reviewed). En el colegio es valioso enseñar desde primaria a identificar estas fuentes, adaptando la complejidad al nivel del estudiante.',
    difficulty: 'basico'
  },

  // ════════════════════════════════════════
  // 🛡️ CATEGORÍA 3: Seguridad y privacidad digital (5 preguntas)
  // ════════════════════════════════════════
  {
    id: 'kmk_11',
    category: 'seguridad',
    categoryLabel: '🛡️ Seguridad y Privacidad Digital',
    question: '¿Qué es el "phishing" y cómo puede afectar a los estudiantes?',
    options: [
      'Es una técnica de programación para crear páginas web falsas',
      'Es un intento de fraude en el que alguien finge ser una entidad confiable para robar datos personales como contraseñas o información bancaria',
      'Es un tipo de juego en línea que puede volverse adictivo para los estudiantes',
      'Es el término técnico para la piratería de software en América Latina'
    ],
    correct: 1,
    explanation: 'El phishing llega típicamente por correo electrónico, mensajes de texto o redes sociales. Los estudiantes son vulnerables porque confían más en los mensajes. Señales de alerta: urgencia extrema, errores ortográficos, remitente sospechoso, solicitud de contraseñas.',
    difficulty: 'basico'
  },
  {
    id: 'kmk_12',
    category: 'seguridad',
    categoryLabel: '🛡️ Seguridad y Privacidad Digital',
    question: 'Un estudiante de 4º grado quiere crear una cuenta en una red social. ¿Cuál es la respuesta más adecuada del docente?',
    options: [
      'Apoyarlo porque las redes sociales desarrollan habilidades comunicativas importantes',
      'Informar que la mayoría de redes sociales tienen un mínimo de edad de 13-16 años, hablar sobre los riesgos específicos y orientar hacia plataformas educativas seguras',
      'Prohibirle terminantemente el uso de internet fuera del colegio',
      'Ignorar el tema porque es responsabilidad exclusiva de los padres'
    ],
    correct: 1,
    explanation: 'La edad mínima en Facebook, Instagram y TikTok es 13 años (COPPA en EE.UU., GDPR en Europa, Ley 1581 en Colombia). El docente tiene un rol orientador: informar sobre los riesgos (huella digital, depredadores, cyberbullying) y ofrecer alternativas seguras.',
    difficulty: 'intermedio'
  },
  {
    id: 'kmk_13',
    category: 'seguridad',
    categoryLabel: '🛡️ Seguridad y Privacidad Digital',
    question: 'Al publicar fotos de estudiantes en blog escolar, ¿qué consideraciones de privacidad son esenciales?',
    options: [
      'Solo es necesario pedir permiso si los estudiantes son menores de 10 años',
      'Obtener consentimiento informado por escrito de los padres/acudientes, evitar datos identificadores (nombres, ubicación), cumplir con la Ley de Protección de Datos (Ley 1581 en Colombia)',
      'Es suficiente con poner el blog en modo privado',
      'No se requiere ningún permiso si las fotos son tomadas dentro del colegio'
    ],
    correct: 1,
    explanation: 'En Colombia la Ley 1581/2012 (Protección de Datos) exige consentimiento para tratar datos de menores. El DSB debe tener formatos de autorización. Adicionalmente, el GDPR aplica para ciudadanos europeos. La regla práctica: nunca publicar nombre + foto + ubicación juntos.',
    difficulty: 'avanzado'
  },
  {
    id: 'kmk_14',
    category: 'seguridad',
    categoryLabel: '🛡️ Seguridad y Privacidad Digital',
    question: '¿Cuál de estas prácticas protege mejor la cuenta de Microsoft 365 de un estudiante?',
    options: [
      'Usar la misma contraseña en todas las plataformas para no olvidarla',
      'Contraseña larga y única (12+ caracteres, combinando tipos), activar autenticación de dos factores y nunca compartirla, ni siquiera con amigos',
      'Guardar la contraseña en un post-it en el cuaderno para no perderla',
      'Cambiar la contraseña cada año aunque no haya ocurrido ningún incidente'
    ],
    correct: 1,
    explanation: 'La autenticación multifactor (MFA) reduce el riesgo de acceso no autorizado en un 99.9% (Microsoft). Una contraseña fuerte usa mayúsculas, minúsculas, números y símbolos: ejemplos "M3dien!Pass#2526" o mejor aún una frase: "¡Aprendo-Mucho-En-4to-Grado!"',
    difficulty: 'intermedio'
  },
  {
    id: 'kmk_15',
    category: 'seguridad',
    categoryLabel: '🛡️ Seguridad y Privacidad Digital',
    question: '¿Qué es el cyberbullying y cuál debe ser la ruta de acción en el colegio cuando se detecta un caso?',
    options: [
      'Es cuando los estudiantes juegan demasiados videojuegos; la solución es retirarles los dispositivos',
      'Es un acoso digital repetido y deliberado. La ruta debe incluir: documentar evidencia, informar a la coordinación, acompañamiento psicológico al afectado, conversación formativa con el agresor y comunicación a las familias',
      'Solo debe manejarse entre los estudiantes involucrados para que aprendan a resolver sus conflictos',
      'Es competencia exclusiva del psicólogo escolar y el docente no debe intervenir'
    ],
    correct: 1,
    explanation: 'El cyberbullying (Ley 1620/2013 en Colombia - Ley de convivencia escolar) requiere intervención institucional. El protocolo del DSB debe incluir: preservar evidencias (capturas de pantalla), nunca borrar, activar el comité de convivencia y garantizar seguridad al estudiante afectado.',
    difficulty: 'avanzado'
  },

  // ════════════════════════════════════════
  // 🎨 CATEGORÍA 4: Producción de contenido digital (5 preguntas)
  // ════════════════════════════════════════
  {
    id: 'kmk_16',
    category: 'produccion',
    categoryLabel: '🎨 Producción de Contenido Digital',
    question: '¿Qué tipo de licencia permite reutilizar, modificar y distribuir una obra libremente, pero exige dar crédito al autor original?',
    options: [
      'Copyright totale — todos los derechos reservados',
      'Creative Commons Atribución (CC BY) — permite usar, distribuir y modificar la obra citando al autor',
      'Dominio público — cualquier obra sin fecha de creación registrada',
      'Licencia de software libre GNU GPL adaptada a contenidos educativos'
    ],
    correct: 1,
    explanation: 'Creative Commons CC BY es la más permisiva. Existen variantes: CC BY-SA (compartir igual), CC BY-NC (no comercial), CC BY-ND (sin derivadas). Para el aula se recomienda buscar recursos en: Pixabay, Unsplash (CC0), Freesound, WikiCommons y enseñar a los estudiantes a citar correctamente.',
    difficulty: 'intermedio'
  },
  {
    id: 'kmk_17',
    category: 'produccion',
    categoryLabel: '🎨 Producción de Contenido Digital',
    question: 'En ClassNotebook, ¿qué ventaja tiene la sección "Espacio de Contenido" (Content Library) frente a la sección "Cuadernos de Colaboración"?',
    options: [
      'El Espacio de Contenido permite a los estudiantes editar materiales del docente directamente',
      'El Espacio de Contenido es de solo lectura para estudiantes (el docente publica recursos); los Cuadernos de Colaboración permiten edición grupal simultánea',
      'No existe diferencia, ambas secciones funcionan exactamente igual',
      'El Espacio de Contenido es solo para archivos PDF; los Cuadernos solo para imágenes'
    ],
    correct: 1,
    explanation: 'Esta distinción es clave en ClassNotebook: Content Library = repositorio de recursos del docente (solo lectura para estudiantes). Collaboration Space = espacio co-editable en tiempo real. Cada estudiante tiene además su Notebook personal donde el docente puede ver pero no editar.',
    difficulty: 'intermedio'
  },
  {
    id: 'kmk_18',
    category: 'produccion',
    categoryLabel: '🎨 Producción de Contenido Digital',
    question: '¿Cuáles son los elementos mínimos que debe incluir una presentación digital de calidad para Klasse 4 o superior?',
    options: [
      'Solo texto, cuanto más texto mejor para demostrar que el estudiante investigó',
      'Título claro, jerarquía visual (máx 5 puntos por diapositiva), imágenes con licencia, fuentes citadas, contraste legible y conclusión o llamada a la acción',
      'Animaciones llamativas y todos los colores posibles para mantener la atención',
      'El estudiante debe copiar exactamente el texto de las fuentes para garantizar precisión'
    ],
    correct: 1,
    explanation: 'La regla 5-5-5: máximo 5 palabras por línea, 5 líneas por diapositiva, 5 diapositivas con idea densa. Regla de contraste WCAG: ratio mínimo 4.5:1 entre texto y fondo. Las imágenes deben tener licencia CC o ser propias. Siempre atribuir fuentes.',
    difficulty: 'basico'
  },
  {
    id: 'kmk_19',
    category: 'produccion',
    categoryLabel: '🎨 Producción de Contenido Digital',
    question: 'Un estudiante graba un video corto para su MedienPass. ¿Qué aspectos técnicos y pedagógicos son más importantes?',
    options: [
      'Que sea lo más largo posible, de al menos 10 minutos, para demostrar esfuerzo',
      'Planificación del guion, buena iluminación, audio claro, duración apropiada al objetivo (1-3 min para primaria), mensaje estructurado y respeto a los derechos de imagen de quienes aparecen',
      'Que use todos los efectos y filtros disponibles en la aplicación',
      'La duración y calidad técnica no importan si el contenido es interesante'
    ],
    correct: 1,
    explanation: 'Para primaria (Klasse 2-6): videos de 1-3 minutos son más efectivos. Preproducción: guion y storyboard. Producción: regla de los tercios, micrófono externo si es posible, fondo limpio. Postproducción: edición básica, subtítulos accesibles. Consentimiento: si aparecen compañeros, obtener permiso.',
    difficulty: 'intermedio'
  },
  {
    id: 'kmk_20',
    category: 'produccion',
    categoryLabel: '🎨 Producción de Contenido Digital',
    question: '¿Qué herramienta del ecosistema Microsoft 365 es más adecuada para que estudiantes creen infografías o diseños visuales de forma colaborativa?',
    options: [
      'Microsoft Word, porque es la herramienta más conocida por todos',
      'Microsoft Sway o Canva for Education, que ofrecen plantillas visuales y colaboración en tiempo real con posibilidad de publicar en ClassNotebook',
      'Microsoft Excel, porque permite insertar gráficos y tablas de datos',
      'Microsoft Outlook, porque facilita el trabajo colaborativo por correo'
    ],
    correct: 1,
    explanation: 'Microsoft Sway genera presentaciones/infografías responsivas web. Canva for Education (gratuita para colegios) permite colaboración en tiempo real y ofrece millones de elementos con licencia. Ambas generan links que se pueden incrustar directamente en las páginas de ClassNotebook.',
    difficulty: 'basico'
  },

  // ════════════════════════════════════════
  // 🤝 CATEGORÍA 5: Comunicación y colaboración digital (5 preguntas)
  // ════════════════════════════════════════
  {
    id: 'kmk_21',
    category: 'comunicacion',
    categoryLabel: '🤝 Comunicación y Colaboración Digital',
    question: '¿Cuál es la diferencia entre comunicar de forma SINCRÓNICA y ASINCRÓNICA en entornos digitales?',
    options: [
      'Sincrónica usa internet; asincrónica puede funcionar offline',
      'Sincrónica ocurre en tiempo real (Teams Meet, videoconferencia, chat en vivo); asincrónica ocurre con diferencia de tiempo (correo, ClassNotebook, foros, tareas)',
      'Sincrónica es más efectiva siempre; asincrónica solo se usa como respaldo',
      'No existe diferencia pedagógica entre ambas modalidades'
    ],
    correct: 1,
    explanation: 'En educación digital ambas tienen valor. Sincrónica: discusiones en tiempo real, dinámicas grupales, retroalimentación inmediata. Asincrónica: permite reflexión, favorece estudiantes con diferentes ritmos, genera evidencia escrita. ClassNotebook combina ambas modalidades eficazmente.',
    difficulty: 'basico'
  },
  {
    id: 'kmk_22',
    category: 'comunicacion',
    categoryLabel: '🤝 Comunicación y Colaboración Digital',
    question: '¿Qué es la "netiqueta" y por qué es importante enseñarla en el aula digital?',
    options: [
      'Es una aplicación para gestionar las contraseñas de los estudiantes en la red del colegio',
      'Son las normas de comportamiento y comunicación ética en entornos digitales: respeto, claridad, responsabilidad en lo que se publica y cómo se interactúa con otros',
      'Es el manual técnico para configurar la red WiFi del colegio',
      'Es solo relevante para adultos que usan redes profesionales como LinkedIn'
    ],
    correct: 1,
    explanation: 'La netiqueta incluye: no escribir en MAYÚSCULAS (percibido como gritar), responder en tiempos razonables, distinguir canales formales (Microsoft Teams) de informales (WhatsApp), respetar diferencias de opinión, no compartir información sin verificar. Es una competencia KMK del área de Comunicación y Colaboración.',
    difficulty: 'basico'
  },
  {
    id: 'kmk_23',
    category: 'comunicacion',
    categoryLabel: '🤝 Comunicación y Colaboración Digital',
    question: 'En Microsoft Teams, al asignar trabajo colaborativo a un grupo de estudiantes, ¿qué buena práctica pedagógica recomienda el marco KMK?',
    options: [
      'Asignar siempre la misma persona como líder del grupo para garantizar calidad',
      'Diseñar roles claros (investigador, redactor, presentador, revisor), establecer normas de colaboración, usar las funciones de co-edición en tiempo real y asegurar que todos contribuyan de forma documentada',
      'Dejar que los estudiantes se organicen solos sin ninguna estructura',
      'Solo usar Teams para comunicación, no para trabajo colaborativo de documentos'
    ],
    correct: 1,
    explanation: 'La colaboración digital efectiva requiere estructura. En Teams: crear canales por proyecto, usar @ para notificaciones específicas, aprovechar la co-edición en Word/PowerPoint en línea, establecer fechas de entrega parciales. ClassNotebook permite al docente ver el proceso, no solo el producto final.',
    difficulty: 'intermedio'
  },
  {
    id: 'kmk_24',
    category: 'comunicacion',
    categoryLabel: '🤝 Comunicación y Colaboración Digital',
    question: '¿Cómo puede un docente usar ClassNotebook para proporcionar retroalimentación personalizada y formativa a cada estudiante?',
    options: [
      'Solo es posible dar retroalimentación grupal a través de anuncios generales en Teams',
      'Accediendo al cuaderno individual de cada estudiante, insertando comentarios, audio, anotaciones de tinta o respuestas en su propia página sin que afecte el trabajo de los demás',
      'Enviando correos electrónicos individuales con archivos adjuntos después de cada clase',
      'ClassNotebook no permite retroalimentación individual, solo grupal'
    ],
    correct: 1,
    explanation: 'ClassNotebook es una herramienta de retroalimentación poderosa: el docente puede acceder al espacio privado de cada estudiante, insertar comentarios de texto, grabaciones de audio cortas (Feedback en voz), hacer anotaciones con lápiz digital y asignar pegatinas/insignias. Cada estudiante ve solo su propio cuaderno.',
    difficulty: 'avanzado'
  },
  {
    id: 'kmk_25',
    category: 'comunicacion',
    categoryLabel: '🤝 Comunicación y Colaboración Digital',
    question: '¿Cuál de estas estrategias promueve mejor la ciudadanía digital activa y responsable en el marco KMK?',
    options: [
      'Prohibir completamente el uso de dispositivos durante el descanso para evitar conflictos',
      'Diseñar proyectos donde los estudiantes creen contenido digital de valor real (para la comunidad, padres, otros grados), reflexionen críticamente sobre el impacto de lo que publican y practiquen la curaduría responsable de información',
      'Limitar el uso de internet a búsquedas de tareas específicas sin navegación libre',
      'Solo usar plataformas sin acceso a internet para garantizar la seguridad de los estudiantes'
    ],
    correct: 1,
    explanation: 'La ciudadanía digital KMK es proactiva, no restrictiva. Implica que los estudiantes sean creadores, curadores y críticos de contenido. Proyectos como: blogs escolares, podcasts para la comunidad, tutoriales para padres o presentaciones en eventos reales desarrollan responsabilidad digital auténtica.',
    difficulty: 'avanzado'
  }
];

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { kmkTrainingQuestions };
}

// Export for browser
if (typeof window !== 'undefined') {
  window.kmkTrainingQuestions = kmkTrainingQuestions;
}
