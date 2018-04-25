import CompanyAnalysis from './CompanyAnalysis';

import { stringsSimilarity } from './utils';

export default class CompanyAnalyzer {
    static domParser = new DOMParser();

    analyze(url) {
        const analysis = new CompanyAnalysis(url);
        const processedUrls = [];
        const processWebsiteSections = url => {
            return this.constructor.parseWebsite(analysis, url)
                .then(url => {
                    processedUrls.push(url);

                    for (let section in analysis.sections) {
                        if (processedUrls.indexOf(analysis.sections[section]) === -1) {
                            return processWebsiteSections(analysis.sections[section]);
                        }
                    }

                    if (processedUrls.indexOf(analysis.originalUrl) === -1) {
                        return processWebsiteSections(analysis.originalUrl);
                    }
                });
        };

        analysis.addSection('Home', analysis.url.protocol + '//' + analysis.url.hostname);

        return processWebsiteSections(analysis.sections['Home'])
            .then(() => this.constructor.parseGlassdoor(analysis))
            .then(() => analysis);
    }

    static parseWebsite(analysis, url) {
        return fetch(url)
            .then(res => res.text())
            .then(html => this.prepareWebsiteDom(analysis, html))
            .then(dom => {
                this.searchSections(
                    analysis,
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
            .then(text => {
                this.searchKeywords(
                    analysis,
                    text,
                    {
                        'Remote': /remote/gi,
                        'Distributed': /distributed/gi,
                        'Decentralized': /decentralized/gi,
                        'Work anywhere': /work\sanywhere/gi,
                    }
                );

                return url;
            });
    }

    static parseGlassdoor(analysis, useDomain = true) {
        return fetch(this.glassdoorSearchUrl(useDomain ? analysis.url.hostname : analysis.name))
            .then(res => res.text())
            .then(html => {
                const dom = this.domParser.parseFromString(html, 'text/html');
                window.dom = dom;
                const resultsDiv = dom.getElementById('MainCol');
                if (resultsDiv) {
                    const resultDivs = resultsDiv.getElementsByClassName('eiHdrModule');
                    if (resultDivs.length > 0) {
                        const resultDiv = resultDivs[0];

                        analysis.glassdoor = {
                            url: resultDiv.getElementsByClassName('header')[0].getElementsByTagName('a')[0].href,
                            name: resultDiv.getElementsByClassName('header')[0].children[0].textContent,
                        };

                        const logos = resultDiv.getElementsByClassName('logo')[0].getElementsByTagName('img');
                        if (logos.length > 0) {
                            analysis.glassdoor.image_url = logos[0].src;
                        }

                        const rating = resultDiv.getElementsByClassName('bigRating');
                        if (rating.length > 0) {
                            analysis.glassdoor.total_reviews = parseInt(
                                resultDiv.getElementsByClassName('empLinks')[0]
                                    .getElementsByClassName('reviews')[0]
                                    .getElementsByClassName('num')[0].innerText
                            );
                            analysis.glassdoor.rating = parseFloat(rating[0].innerText);
                        } else {
                            analysis.glassdoor.total_reviews = 0;
                        }

                        return;
                    }
                }

                if (useDomain) {
                    return this.parseGlassdoor(analysis, false);
                }
            });
    }

    static prepareWebsiteDom(analysis, html) {
        const dom = this.domParser.parseFromString(html, 'text/html');

        while (dom.body.getElementsByTagName('script').length > 0) {
            dom.body.getElementsByTagName('script')[0].remove();
        }

        if (!analysis.name) {
            const titles = dom.head.getElementsByTagName('title');
            if (titles.length > 0) {
                let name = titles[0].innerText;

                const separators = ['-', '|', '–', '—'];
                const domainBasename = analysis.url.hostname.split('.').reduce((a, b) => a.length > b.length ? a : b);
                for (let separator of separators) {
                    name = name.split(separator).map(str => str.trim()).reduce((a, b) => {
                        return stringsSimilarity(a, domainBasename) > stringsSimilarity(b, domainBasename) ? a : b;
                    });
                }

                analysis.name = name;
            }
        }

        return dom;
    }

    static searchSections(analysis, dom, sections) {
        for (let link of dom.body.getElementsByTagName('a')) {
            const url = link.getAttribute('href');
            if (!url.startsWith('mailto:')) {
                for (let name in sections) {
                    if (!(name in analysis.sections) && link.innerText.trim().match(sections[name]) !== null) {
                        analysis.addSection(name, url);
                    }
                }
            }
        }
    }

    static searchKeywords(analysis, text, keywords) {
        for (let name in keywords) {
            const matches = text.match(keywords[name]);
            analysis.addKeyword(name, (matches && matches.length) || 0);
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
