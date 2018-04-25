export default class {
    constructor(url) {
        this.url = new URL(url);
        this.sections = {};
        this.keywords = {};
    }

    addSection(name, url) {
        if (url.startsWith('/')) {
            url = this.url.protocol + '//' + this.url.hostname + url;
        } else if (!url.startsWith('http')) {
            url = this.url.protocol + '//' + this.url.hostname + this.url.pathname + '/' + url;
        }
        this.sections[name] = url;
    }

    addKeyword(name, count) {
        if (name in this.keywords) {
            this.keywords[name] += count;
        } else {
            this.keywords[name] = count;
        }
    }

    get originalUrl() {
        return this.url.href;
    }
}
