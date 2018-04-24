browser.contextMenus.create({
    id: 'inspect',
    title: 'Inspect for remote jobs',
    icons: {
        '16': 'icons/icon.svg',
        '32': 'icons/icon.svg',
    },
    contexts: ['link'],
});

browser.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === 'inspect') {
        browser.windows.create({
            type: 'panel',
            url: 'build/panel.html?url=' + encodeURIComponent(info.linkUrl),
            width: 500,
            height: 400,
        });
    }
});
