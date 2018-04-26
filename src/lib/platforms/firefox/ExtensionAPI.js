export default class {
    constructor() {
        this.listeners = {};
    }

    sendMessage(action, data = null) {
        const message = { action };
        if (data) {
            message['data'] = data;
        }
        return browser.runtime.sendMessage(message);
    }

    handleMessage(action, callback) {
        if (!this.onMessageListener) {
            browser.runtime.onMessage.addListener(this.onMessageListener = (message, sender, sendResponse) => {
                const action = message.action;

                if (action in this.listeners) {
                    const callback = this.listeners[action];
                    const result = message.data ? callback(message.data) : callback();
                    sendResponse(result);
                }
            });
        }

        this.listeners[action] = callback;
    }

    addMenuItem(options, callback) {
        browser.contextMenus.create(options);

        browser.contextMenus.onClicked.addListener((info, tab) => {
            if (info.menuItemId === options.id) {
                callback(info);
            }
        });
    }

    createWindow(options) {
        return browser.windows.create(options);
    }

    get storage() {
        return new Storage();
    }
}

class Storage {
    set(key, value) {
        const data = {};
        data[key] = value;
        return browser.storage.local.set(data);
    }

    get(key) {
        return browser.storage.local.get(key).then(data => (data && key in data) ? data[key] : null);
    }
}
