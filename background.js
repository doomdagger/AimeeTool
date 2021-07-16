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
    }

    addItems(items, callback) {
        let added = {};

        if (Array.isArray(items)) {
            for (let i = 0; i < items.length; ++i) {
                added[items[i].code] = items[i];
            }
        } else {
            added[items.code] = items;
        }
        console.log(added);
        chrome.storage.local.set(added, callback);
    }

    delItems(items, callback) {
        let deleted = [];

        if (Array.isArray(items)) {
            for (let i = 0; i < items.length; ++i) {
                deleted.push(items[i].code);
            }
        } else {
            deleted.push(items.code);
        }
        console.log(deleted);
        chrome.storage.local.remove(deleted, callback);
    }

    updateItem(items, callback) {
        let updated = [];

        if (Array.isArray(items)) {
            for (let i = 0; i < items.length; ++i) {
                updated.push(items[i].code);
            }
        } else {
            updated.push(items.code);
        }

        chrome.storage.local.get(updated, itemsKept => {
            let newItems = []

            for (let i = 0; i < updated.length; ++i) {
                if (updated[i] in itemsKept) {
                    newItems.push({ ...items[i], ...itemsKept[updated[i]] });
                }
            }

            this.addItems(newItems, callback);
        });
    }

    handleResponseFromTab(response) {
        // interact with storage
        switch (response.type) {
            case MESSAGE_TYPE_ADD_ITEMS:
                this.addItems(response.items, () => {
                    chrome.tabs.sendMessage(response.tabId, { type: MESSAGE_TYPE_ITEMS_ADDED }, () => { });
                });
                break;
            case MESSAGE_TYPE_DEL_ITEMS:
                this.delItems(response.items, () => {
                    chrome.tabs.sendMessage(response.tabId, { type: MESSAGE_TYPE_ITEMS_DELED }, () => { });
                });
                break;
            default:
                break;
        }
    }

    postRequestToTab(type, tabId) {
        chrome.tabs.sendMessage(tabId, { type: type, tabId: tabId }, response => {
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

chrome.runtime.onInstalled.addListener(() => {
    setTimeout(() => {
        Service.setup();
    }, 222)
});
