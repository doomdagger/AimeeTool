'use strict';

const ADD_SUCCESS = 'Successfully Add Item(s)!';
const ADD_FAILURE = 'Failed to Add Item(s)! Contact Me!';

const DEL_SUCCESS = 'Successfully Delete Item(s)!';
const DEL_FAILURE = 'Failed to Delete Item(s)! Contact Me!';

/**
 * Class Assistant
 */
class Assistant {
    constructor () {
        
    }

    fetchCheckedItems() {
        let checkedItems = []

        $('el-table__body-wrapper div').find('.el-checkbox__input .is-checked').forEach((item, index, array) => {
            let tableRow = item.closest('.el-table__row tr').first();
            let tableCols = tableRow.children('td');
            
            // get code
            let code = tableCols.eq(1).children('.cell div').children('div').first().text();
            // get name
            let infoCol = tableCols.eq(2).children('.cell div');
            let name = infoCol.text();
            let brand = infoCol.children('div').eq(-2).children('span').text();
            // get image url
            let imageURL = tableCols.eq(3).find('image').attr('data-src');
            // inventory
            let globalInventory = tableCols.eq(4).find('p').text();
            // original price
            let origPrice = tableCols.eq(7).find('p').last().text();
            
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
    
    postAddMessage()
    {
        this._port.postMessage({
            type: 'Add',
            content: this.fetchCheckedItems()
        })
    }

    postDelMessage()
    {
        this._port.postMessage({
            type: 'Del',
            content: this.fetchCheckedItems()
        })
    }

    onMessage(message) {
        
    }

    onDisconnect(port) {

    }

    connect() {
        let port = this._port = chrome.runtime.connect({name : 'assistant'});
        port.onMessage.addListener(message => this.onMessage(message));
        port.onDisconnect.addListener(port => this.onDisconnect(port));
        return this;
    }

    disconnect() {
        if (this._port) {
            this._port.disconnect();
        }
        return this;
    }

    open() {
        return this.connect();
    }

    close() {
        return this.disconnect();
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