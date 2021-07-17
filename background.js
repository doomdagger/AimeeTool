// background.js

const MESSAGE_TYPE_ADD_ITEMS = ADD_ITEMS_MENU_ITEM_ID = 'AddItems';
const MESSAGE_TYPE_DEL_ITEMS = DEL_ITEMS_MENU_ITEM_ID = 'DelItems';

const MESSAGE_TYPE_ITEMS_ADDED = 'ItemsAdded';
const MESSAGE_TYPE_ITEMS_DELED = 'ItemsDeled';

const MENU_URL_PATTERN = [
    "file:///G:/MyWorkThings/AimeeTest/*",
    "http://erp.ilovelook.cn/*",
    "https://erp.ilovelook.cn/*"
];


/**
 * Class Service
 */
class Service {

    constructor() {
        let contexts = ['page', 'selection', 'link', 'editable', 'image', 'video', 'audio'];

        chrome.contextMenus.create({
            id: ADD_ITEMS_MENU_ITEM_ID,
            contexts: contexts,
            title: 'Add Items',
            documentUrlPatterns: MENU_URL_PATTERN,
        }, () => {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError.message);
            }
        });

        chrome.contextMenus.create({
            id: DEL_ITEMS_MENU_ITEM_ID,
            contexts: contexts,
            title: 'Del Items',
            documentUrlPatterns: MENU_URL_PATTERN,
        }, () => {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError.message);
            }
        });

        chrome.contextMenus.onClicked.addListener((info, tab) => {
            this.postRequestToTab(info.menuItemId, tab.id);
        });

        chrome.commands.onCommand.addListener((command) => {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                this.postRequestToTab(command, tabs[0].id);
            });
        });

        console.log("successfully register all listeners");
    }

    addItems(items, callback) {
        if (items == null || ((items instanceof Array) && (items.length == 0))) {
            callback(MESSAGE_TYPE_ITEMS_ADDED, false, "empty list or null item provided!");
            return;
        }

        let added = {};

        if (Array.isArray(items)) {
            for (let i = 0; i < items.length; ++i) {
                if ("code" in items[i]) {
                    added[items[i].code] = items[i];
                } else {
                    callback(MESSAGE_TYPE_ITEMS_ADDED, false, "invalid item provided!");
                    return;
                }
            }
        } else {
            if ("code" in items) {
                added[items.code] = items;
            } else {
                callback(MESSAGE_TYPE_ITEMS_ADDED, false, "invalid item provided!");
                return;
            }
        }
        chrome.storage.local.set(added, () => {
            callback(MESSAGE_TYPE_ITEMS_ADDED, true, "item(s) added successfully!");
        });
    }

    delItems(items, callback) {
        if (items == null || ((items instanceof Array) && (items.length == 0))) {
            callback(MESSAGE_TYPE_ITEMS_DELED, false, "empty list or null item provided!");
            return;
        }

        let deleted = [];

        if (Array.isArray(items)) {
            for (let i = 0; i < items.length; ++i) {
                if ("code" in items[i]) {
                    deleted.push(items[i].code);
                } else {
                    callback(MESSAGE_TYPE_ITEMS_DELED, false, "invalid item provided!");
                    return;
                }
            }
        } else {
            if ("code" in items) {
                deleted.push(items.code);
            } else {
                callback(MESSAGE_TYPE_ITEMS_DELED, false, "invalid item provided!");
                return;
            }
        }
        chrome.storage.local.remove(deleted, () => {
            callback(MESSAGE_TYPE_ITEMS_DELED, true, "item(s) deleted successfully!")
        });
    }

    updateItem(items, callback) {
        if (items == null || ((items instanceof Array) && (items.length == 0))) {
            callback(MESSAGE_TYPE_ITEMS_ADDED, false, "empty list or null item provided!");
            return;
        }

        let updated = [];

        if (Array.isArray(items)) {
            for (let i = 0; i < items.length; ++i) {
                if ("code" in items[i]) {
                    updated.push(items[i].code);
                } else {
                    callback(MESSAGE_TYPE_ITEMS_ADDED, false, "invalid item provided!");
                    return;
                }
            }
        } else {
            if ("code" in items[i]) {
                updated.push(items.code);
            } else {
                callback(MESSAGE_TYPE_ITEMS_ADDED, false, "invalid item provided!");
                return;
            }
        }

        chrome.storage.local.get(updated, itemsKept => {
            let newItems = [];

            if (updated.length > 1) {
                for (let i = 0; i < updated.length; ++i) {
                    if (updated[i] in itemsKept) {
                        newItems.push({ ...items[i], ...itemsKept[updated[i]] });
                    }
                }
            } else {
                newItems.push({ ...items, ...itemsKept[updated[0]] });
            }

            this.addItems(newItems, callback);
        });
    }

    postRequestToTab(type, tabId) {
        chrome.tabs.sendMessage(tabId, { type: type, tabId: tabId }, response => {
            // interact with storage
            switch (response.type) {
                case MESSAGE_TYPE_ADD_ITEMS:
                    this.addItems(response.items, (type, success, message) => {
                        chrome.tabs.sendMessage(response.tabId, { type: type, success: success, message: message }, () => { });
                    });
                    break;
                case MESSAGE_TYPE_DEL_ITEMS:
                    this.delItems(response.items, (type, success, message) => {
                        chrome.tabs.sendMessage(response.tabId, { type: type, success: success, message: message }, () => { });
                    });
                    break;
                default:
                    break;
            }

            this.handleResponseFromTab(response);
        });
    }

    static get instance() {
        if (!Service._instance) {
            Service._instance = new Service();
        }
        return Service._instance;
    }

    static setup() {
        return Service.instance;
    }
}

setTimeout(() => {
    Service.setup();
}, 888);