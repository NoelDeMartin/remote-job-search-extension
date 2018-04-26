import Extension from './lib/Extension';

let keywords = {};

Extension.storage.get('keywords').then(storageKeywords => {
    keywords = storageKeywords || {
        'Remote': 'remote',
        'Distributed': 'distributed',
        'Decentralized': 'decentralized',
        'Work anywhere': 'work\\sanywhere',
    };
});

Extension.handleMessage('get-keywords', () => keywords);
Extension.handleMessage('update-keywords', data => {
    keywords = data.keywords;
    Extension.storage.set('keywords', keywords);
});

Extension.addMenuItem(
    {
        id: 'inspect',
        title: 'Search remote company',
        icons: {
            '16': 'icons/icon.svg',
            '32': 'icons/icon.svg',
        },
        contexts: [
            'selection',
            'link',
            'page',
        ],
    },
    info => {
        let url = 'build/panel.html?';
        if (info.selectionText) {
            url += 'text=' + encodeURIComponent(info.selectionText);
        } else if (info.linkUrl || info.pageUrl) {
            url += 'link=' + encodeURIComponent(info.linkUrl || info.pageUrl);
        }
        Extension.createWindow({
            url,
            type: 'panel',
            width: 500,
            height: 400,
        });
    }
);
