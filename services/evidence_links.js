// Vínculos de evidencia de un reto. Se guardan en la columna `link` de multimedia_products, uno por
// línea, sin cambiar la tabla. Un registro anterior con un solo vínculo se lee igual.

const MAX_LINKS = 3;
const MAX_LINK_LENGTH = 500;
const MAX_DESCRIPTION_LENGTH = 500;
const PRODUCT_TYPES = ['video', 'presentacion', 'canvas', 'otro'];

function isValidLink(value) {
    const text = String(value || '').trim();
    if (!text || text.length > MAX_LINK_LENGTH) return false;
    try {
        const { protocol } = new URL(text);
        return protocol === 'http:' || protocol === 'https:';
    } catch (e) {
        return false;
    }
}

const splitStored = stored => String(stored || '').split('\n').map(line => line.trim()).filter(Boolean);

// Todo lo guardado, también lo que no es válido, para que el estudiante pueda corregirlo
function storedLinks(stored) {
    return splitStored(stored);
}

// Solo los vínculos válidos: los únicos que cuentan como evidencia y que el panel enlaza
function validLinks(stored) {
    return splitStored(stored).filter(isValidLink);
}

// Lo que envía el estudiante: { links } si se puede guardar, o { error }
function normalizeLinks(input) {
    const list = (Array.isArray(input) ? input : [input]).map(value => String(value == null ? '' : value).trim()).filter(Boolean);
    const links = [...new Set(list)];
    if (links.length > MAX_LINKS) return { error: 'too_many' };
    if (links.some(link => !isValidLink(link))) return { error: 'invalid' };
    return { links };
}

module.exports = { MAX_LINKS, MAX_DESCRIPTION_LENGTH, PRODUCT_TYPES, isValidLink, storedLinks, validLinks, normalizeLinks };
