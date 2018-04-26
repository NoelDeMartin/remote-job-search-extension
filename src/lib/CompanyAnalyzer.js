
import Extension from './Extension';
import CompanyInformation from './CompanyInformation';

import { stringsSimilarity } from './utils';

export default class CompanyAnalyzer {
    static domParser = new DOMParser();

    analyzeLink(url) {
        const info = new CompanyInformation(url);

        info.url = new URL(url);
        info.addSection('Home', info.url.protocol + '//' + info.url.hostname);

        return this.constructor.processWebsiteSections(info)
            .then(() => this.constructor.parseGlassdoor(
                info,
                info.name
                    ? [info.url.hostname, info.name]
                    : [info.url.hostname]
            ))
            .then(() => info);
    }

    analyzeText(text) {
        const info = new CompanyInformation(text);

        return this.constructor.parseGlassdoor(info, [text])
            .then(() => {
                if (info.url) {
                    info.addSection('Home', info.url.protocol + '//' + info.url.hostname);
                    return this.constructor.processWebsiteSections(info);
                }
            })
            .then(() => info);
    }

    static processWebsiteSections(info, url = null, processedUrls = []) {
        if (url === null) {
            url = info.sections['Home'];
        }
        return this.parseWebsite(info, url)
            .then(url => {
                processedUrls.push(url);

                for (let section in info.sections) {
                    if (processedUrls.indexOf(info.sections[section]) === -1) {
                        return this.processWebsiteSections(info, info.sections[section], processedUrls);
                    }
                }

                if (info.source.startsWith('http') && processedUrls.indexOf(info.source) === -1) {
                    return this.processWebsiteSections(info, info.source, processedUrls);
                }
            });
    }

    static parseWebsite(info, url) {
        return fetch(url)
            .then(res => res.text())
            .then(html => this.prepareWebsiteDom(info, html))
            .then(dom => {
                info.found = true;

                this.searchSections(
                    info,
                    dom,
                    {
                        'Careers': /careers/gi,
                        'About': /about/gi,
                        'Team': /team/gi,
                        'Jobs': /jobs|work\swith\sus|hiring|open\spositions/gi,
                    }
                );

                return dom.body.textContent;
            })
            .then(text => Extension.sendMessage('get-keywords').then(keywords => {
                for (let name in keywords) {
                    keywords[name] = new RegExp(keywords[name], 'gi');
                }
                return { keywords, text };
            }))
            .then(({ keywords, text }) => {
                this.searchKeywords(info, text, keywords);

                return url;
            });
    }

    static parseGlassdoor(info, searchTerms) {
        return fetch(this.glassdoorSearchUrl(searchTerms.shift()))
            .then(res => res.text())
            .then(html => {
                const dom = this.domParser.parseFromString(html, 'text/html');
                window.dom = dom;
                const resultsDiv = dom.getElementById('MainCol');
                if (resultsDiv) {
                    const resultDivs = resultsDiv.getElementsByClassName('eiHdrModule');
                    if (resultDivs.length > 0) {
                        const resultDiv = resultDivs[0];

                        info.found = true;
                        info.glassdoor = {
                            url: 'https://www.glassdoor.com/' +
                                resultDiv.getElementsByClassName('header')[0].getElementsByTagName('a')[0].getAttribute('href'),
                            name: resultDiv.getElementsByClassName('header')[0].children[0].textContent,
                        };

                        const logos = resultDiv.getElementsByClassName('logo')[0].getElementsByTagName('img');
                        if (logos.length > 0) {
                            info.glassdoor.image_url = logos[0].src;
                        }

                        const rating = resultDiv.getElementsByClassName('bigRating');
                        if (rating.length > 0) {
                            info.glassdoor.total_reviews = parseInt(
                                resultDiv.getElementsByClassName('empLinks')[0]
                                    .getElementsByClassName('reviews')[0]
                                    .getElementsByClassName('num')[0].innerText
                            );
                            info.glassdoor.rating = parseFloat(rating[0].innerText);
                        } else {
                            info.glassdoor.total_reviews = 0;
                        }

                        if (!info.url) {
                            const webInfo = resultDiv.getElementsByClassName('webInfo');
                            if (webInfo.length > 0) {
                                const urls = webInfo[0].getElementsByClassName('url');
                                if (urls.length > 0) {
                                    let url = urls[0].innerText;
                                    if (!url.startsWith('http')) {
                                        url = 'http://' + url;
                                    }
                                    info.url = new URL(url);
                                }
                            }
                        }

                        return;
                    }
                }

                if (searchTerms.length > 0) {
                    return this.parseGlassdoor(info, searchTerms);
                }
            });
    }

    static prepareWebsiteDom(info, html) {
        const dom = this.domParser.parseFromString(html, 'text/html');

        while (dom.body.getElementsByTagName('script').length > 0) {
            dom.body.getElementsByTagName('script')[0].remove();
        }

        if (!info.name) {
            const titles = dom.head.getElementsByTagName('title');
            if (titles.length > 0) {
                let name = titles[0].innerText;

                const separators = ['-', '|', '–', '—'];
                const domainBasename = info.url.hostname.split('.').reduce((a, b) => a.length > b.length ? a : b);
                for (let separator of separators) {
                    name = name.split(separator).map(str => str.trim()).reduce((a, b) => {
                        return stringsSimilarity(a, domainBasename) > stringsSimilarity(b, domainBasename) ? a : b;
                    });
                }

                info.name = name;
            }
        }

        return dom;
    }

    static searchSections(info, dom, sections) {
        for (let link of dom.body.getElementsByTagName('a')) {
            const url = link.getAttribute('href');
            if (url && !url.startsWith('mailto:')) {
                for (let name in sections) {
                    if (!(name in info.sections) && link.innerText.trim().match(sections[name]) !== null) {
                        info.addSection(name, url);
                    }
                }
            }
        }
    }

    static searchKeywords(info, text, keywords) {
        for (let name in keywords) {
            const matches = text.match(keywords[name]);
            info.addKeyword(name, (matches && matches.length) || 0);
        }
    }

    static glassdoorSearchUrl(search) {
        let query = search.replace(/\.|\s/g, '-').toLowerCase();
        if (query.startsWith('www-')) {
            query = query.substr(4);
        }
        return 'https://www.glassdoor.com/Reviews/' + query + '-reviews-SRCH_KE0,' + query.length + '.htm';
    }
}
