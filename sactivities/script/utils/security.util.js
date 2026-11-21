// // /**
// //  * Encode less-than and ampersand characters with entity codes to make user-
// //  * provided text safe to parse as HTML.
// //  *
// //  * @param {string} s String to escape
// //  *
// //  * @returns {string} String with unsafe characters escaped with entity codes
// //  */
export const escapeForHTML = s => s.replace(/[&<]/g, c => c === '&' ? '&amp;' : '&lt;');
