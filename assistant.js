const MESSAGE_TYPE_ADD_ITEMS = 'AddItems';
const MESSAGE_TYPE_DEL_ITEMS = 'DelItems';

const MESSAGE_TYPE_ITEMS_ADDED = 'ItemsAdded';
const MESSAGE_TYPE_ITEMS_DELED = 'ItemsDeled';

/**
 * Class Assistant
 */
class Assistant {
    constructor() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            // only service worker can send message
            switch (request.type) {
                case MESSAGE_TYPE_ADD_ITEMS:
                case MESSAGE_TYPE_DEL_ITEMS:
                    sendResponse({
                        type: request.type,
                        tabId: request.tabId,
                        items: this.fetchCheckedItems()
                    });
                    break;
                case MESSAGE_TYPE_ITEMS_ADDED:
                case MESSAGE_TYPE_ITEMS_DELED:
                    if (request.success) {
                        alertify.success(request.message);
                    } else {
                        alertify.error(request.message);
                    }
                    break;
                default:
                    break;
            }
        });
        console.log("successfully add message listener");
    }

    fetchCheckedItems() {
        let checkedItems = []

        $('.el-table__body-wrapper div').find('.el-checkbox__input').filter('.is-checked').forEach((item, index, array) => {
            let tableCols = $(item).closest('tr').children('td');
            // get code
            let code = tableCols.eq(1).children('div').children('div').first().text();
            // get name
            let infoCol = tableCols.eq(2).children('div');
            let name = infoCol.text();
            let brand = $(infoCol.children('div').eq(-2)).children('span').text();
            // get image url
            let imageURL = tableCols.eq(3).find('img').attr('data-src');
            // inventory
            let globalInventory = parseInt(tableCols.eq(4).find('p').text());
            // original price
            let origPrice = parseFloat(tableCols.eq(7).find('p').last().text().match(/\d+/)[0]);

            checkedItems.push({
                code: code,
                name: name,
                brand: brand,
                imageURL: imageURL,
                globalInventory: globalInventory,
                origPrice: origPrice,
                timestamp: Date.now()
            });
        });

        return checkedItems;
    }

    static get instance() {
        if (!Assistant._instance) {
            Assistant._instance = new Assistant();
        }
        return Assistant._instance;
    }

    static setup() {
        return Assistant.instance;
    }
}

window.assistant = Assistant.setup();
