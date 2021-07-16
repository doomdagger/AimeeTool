const MESSAGE_TYPE_ADD_ITEMS = 'AddItems';
const MESSAGE_TYPE_DEL_ITEMS = 'DelItems';

const MESSAGE_TYPE_ITEMS_ADDED = 'ItemsAdded';
const MESSAGE_TYPE_ITEMS_DELED = 'ItemsDeled';

const ADD_SUCCESS = 'Successfully Add Item(s)!';
const ADD_FAILURE = 'Failed to Add Item(s)! Contact Me!';

const DEL_SUCCESS = 'Successfully Delete Item(s)!';
const DEL_FAILURE = 'Failed to Delete Item(s)! Contact Me!';

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
                    console.log('successfully add items');
                    alertify.success(ADD_SUCCESS);
                    break;
                case MESSAGE_TYPE_ITEMS_DELED:
                    console.log('successfully del items');
                    alertify.success(DEL_SUCCESS);
                    break;
                default:
                    break;
            }
        });
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
                origPrice: origPrice
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

(async () => {
    Assistant.setup();
})();

