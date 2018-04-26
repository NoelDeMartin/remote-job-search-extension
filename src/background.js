browser.contextMenus.create({
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
});

browser.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === 'inspect') {
        console.log(info);
        let url = 'build/panel.html?';
        if (info.selectionText) {
            url += 'text=' + encodeURIComponent(info.selectionText);
        } else if (info.linkUrl || info.pageUrl) {
            url += 'link=' + encodeURIComponent(info.linkUrl || info.pageUrl);
        }
        browser.windows.create({
            url,
            type: 'panel',
            width: 500,
            height: 400,
        });
    }
});

let keywords = {};

browser.storage.local.get('keywords').then(newKeywords => {
    if (Object.keys(newKeywords).length > 0) {
        keywords = newKeywords;
    } else {
        keywords = {
            'Remote': 'remote',
            'Distributed': 'distributed',
            'Decentralized': 'decentralized',
            'Work anywhere': 'work\\sanywhere',
        };
    }
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'get-keywords':
            sendResponse(keywords);
            break;
        case 'update-keywords':
            keywords = message.data.keywords;
            browser.storage.local.set('keywords', keywords);
            break;
    }
});
