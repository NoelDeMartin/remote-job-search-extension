let Api;

if (typeof browser !== 'undefined') {
    Api = require('./platforms/firefox/ExtensionAPI.js').default;
} else if (typeof chrome !== 'undefined') {
    Api = require('./platforms/chrome/ExtensionAPI.js').default;
}

export default new Api();
