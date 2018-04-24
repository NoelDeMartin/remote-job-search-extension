export default class {
    constructor(url) {
        url = new URL(url);
        this.url = url.href;
        this.protocol = url.protocol;
        this.domain = url.hostname;
        this.pathname = url.pathname;
        this.sections = {};
        this.keywords = {};
    }

    addSection(name, url) {
        if (url.startsWith('/')) {
            url = this.protocol + '//' + this.domain + url;
        } else if (!url.startsWith('http')) {
            url = this.protocol + '//' + this.domain + this.pathname + '/' + url;
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
}
