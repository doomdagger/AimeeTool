'use strict';

class Explorer {

    constructor() {
        this.getAllItems('brand');
    }

    getAllItems(sortKey) {
        if (sortKey == null) {
            sortKey = 'code'
        }

        chrome.storage.local.get(null, items => {
            let sortedItems = []

            for (let key in items) {
                let item = items[key];
                if (item instanceof Object && 'code' in item) {
                    sortedItems.push(item);
                }
            }

            sortedItems.sort((a, b) => {
                if (a[sortKey] < b[sortKey]) {
                    return -1;
                } else if (a[sortKey] > b[sortKey]) {
                    return 1;
                } else {
                    return 0;
                }
            });

            let tableBody = $('table tbody');
            tableBody.empty();
            for (let i = 0; i < sortedItems.length; ++i) {
                let item = sortedItems[i];
                let snippet = `\
                    <tr>
                        <td>${item["code"]}</td>
                        <td>${item["name"]}</td>
                        <td>${item["brand"]}</td>
                        <td><img height="100" data-src="${item["imageURL"]}" src="${item["imageURL"]}" lazy="loaded"></img></td>
                        <td>${item["globalInventory"]}</td>
                        <td>${item["origPrice"]}</td>
                        <td><button class="button-primary" id="${item["code"]}"><span class="icon"><i class="fas fa-trash-alt"></i></span></button></td>
                    </tr>`;
                tableBody.append(snippet);
            }
        });
    }

    static get instance() {
        if (!Explorer._instance) {
            Explorer._instance = new Explorer();
        }
        return Explorer._instance;
    }

    static setup() {
        return Explorer.instance;
    }
}

Explorer.setup();