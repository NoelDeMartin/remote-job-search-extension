import CompanyAnalysis from './CompanyAnalysis';

export default class CompanyAnalyzer {
    static domParser = new DOMParser();

    analyze(url) {
        const analysis = new CompanyAnalysis(url);

        analysis.addSection('Homepage', analysis.protocol + '//' + analysis.domain);

        const visited = [];
        const parseWebsite = url => {
            return this.constructor.parseWebsiteUrl(analysis, url)
                .then(url => {
                    visited.push(url);

                    for (let section in analysis.sections) {
                        if (visited.indexOf(analysis.sections[section]) === -1) {
                            return parseWebsite(analysis.sections[section]);
                        }
                    }
                });
        };

        return parseWebsite(analysis.url)
            .then(() => this.constructor.parseGlassdoor(analysis))
            .then(() => analysis);
    }

    static parseWebsiteUrl(analysis, url) {
        return fetch(url)
            .then(res => res.text())
            .then(html => {
                const dom = this.domParser.parseFromString(html, 'text/html');
                while (dom.body.getElementsByTagName('script').length > 0) {
                    dom.body.getElementsByTagName('script')[0].remove();
                }

                const titles = dom.head.getElementsByTagName('title');
                if (titles.length > 0) {
                    analysis.name = [0].innerText;
                } else {
                    analysis.name = '';
                }

                return dom;
            })
            .then(dom => {
                this.searchSection(analysis, 'Careers', 'careers', dom);
                this.searchSection(analysis, 'About', 'about', dom);
                this.searchSection(analysis, 'Team', 'team', dom);
                this.searchSection(analysis, 'Jobs', 'jobs', dom);
                return dom.body.textContent;
            })
            .then(text => {
                this.searchKeyword(analysis, 'Remote', /remote/gi, text);
                this.searchKeyword(analysis, 'Distributed', /distributed/gi, text);
                this.searchKeyword(analysis, 'Decentralized', /decentralized/gi, text);
                this.searchKeyword(analysis, 'Work anywhere', /work\sanywhere/gi, text);

                return url;
            });
    }

    static parseGlassdoor(analysis) {
        return fetch(this.glassdoorSearchUrl(analysis))
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
                    }
                }
            });
    }

    static searchSection(analysis, name, search, dom) {
        const link = dom.evaluate(
            '/html/body//a[contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "' + search + '")]',
            dom,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;
        if (link && link.getAttribute('href') && !link.getAttribute('href').startsWith('mailto:')) {
            analysis.addSection(name, link.getAttribute('href'));
        }
    }

    static searchKeyword(analysis, name, regex, text) {
        const matches = text.match(regex);
        analysis.addKeyword(name, (matches && matches.length) || 0);
    }

    static glassdoorSearchUrl(analysis) {
        let query = analysis.domain.replace('.', '-');
        if (query.startsWith('www-')) {
            query = query.substr(4);
        }
        return 'https://www.glassdoor.com/Reviews/' + query + '-reviews-SRCH_KE0,' + query.length + '.htm';
    }
}
