export default class {
    constructor() {
        this.listeners = {};
    }

    sendMessage(action, data = null) {
        const message = { action };
        if (data) {
            message['data'] = data;
        }
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(message, result => {
                if (result === undefined && chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result);
                }
            });
        });
    }

    handleMessage(action, callback) {
        if (!this.onMessageListener) {
            chrome.runtime.onMessage.addListener(this.onMessageListener = (message, sender, sendResponse) => {
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
        chrome.contextMenus.create(options);

        chrome.contextMenus.onClicked.addListener((info, tab) => {
            if (info.menuItemId === options.id) {
                callback(info);
            }
        });
    }

    createWindow(options) {
        return chrome.windows.create(options);
    }

    get storage() {
        return new Storage();
    }
}

class Storage {
    set(key, value) {
        const data = {};
        data[key] = value;
        return new Promise((resolve, reject) => {
            chrome.storage.local.set(data, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        });
    }

    get(key) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(key, data => {
                if (data === undefined && chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve((data && key in data) ? data[key] : null);
                }
            });
        });
    }
}
