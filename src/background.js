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
