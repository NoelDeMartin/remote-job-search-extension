let Api;

if (browser) {
    Api = require('./platforms/firefox/ExtensionAPI.js').default;
} else if (chrome) {
    Api = require('./platforms/chrome/ExtensionAPI.js').default;
}

export default new Api();
