interface ExtensionAPI {

    storage: ExtensionStorage;

    sendMessage(action: string, data?: Object): Promise<any>;

    on(action: string, callback: Function): void;

    addMenuItem(options: MenuItemOptions, callback: Function): void;

    createWindow(options: WindowOptions): void;

}

interface ExtensionStorage {

    set(key: string, value: any): Promise<any>;

    get(key: string): Promise<any>;

}

type MenuItemOptions = {
    id: string,
    checked?: boolean,
    contexts?: string[],
    documentUrlPatterns?: string | string[],
    enabled?: boolean,
    onclick?: Function,
    parentId?: integer | string,
    targetUrlPatterns?: string | string[],
    title?: string,
    type?: string,
};

type WindowOptions = {
    url: string,
    type?: string,
    top?: number,
    left?: number,
    width?: number,
    height?: number,
    allowScriptsToClose?: boolean,
    focused?: boolean,
    incognito?: boolean,
    tabId?: number,
    titlePreface?: string,
};
