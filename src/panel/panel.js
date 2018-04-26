import Vue from 'vue';

import Panel from './Panel.vue';

const panel = new Vue({
    render: h => h(Panel),
});

panel.$mount('#panel');

// Bug workaround for FF57: https://bugzilla.mozilla.org/show_bug.cgi?id=1425829
if (browser) {
    setTimeout(() => {
        browser.windows.getCurrent().then(currentWindow => {
            browser.windows.update(currentWindow.id, {
                width: currentWindow.width,
                height: currentWindow.height + 1,
            });
        });
    }, 500);
}
