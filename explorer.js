'use strict';

class Explorer {

    constructor() {
        this._sortKey = 'timestamp';
        this._sortInc = true;

        this.getAllItems(this._sortKey, this._sortInc);

        $('th>button').on('click', event => {
            let eventBtn = $(event.target);
            let curSortKey = eventBtn.attr('id');
            if (!curSortKey) {
                eventBtn = eventBtn.closest('button');
                curSortKey = eventBtn.attr('id');
            }

            let iconElem = eventBtn.find('i');
            iconElem.removeClass();
            
            if (curSortKey == this._sortKey) {
                this._sortInc = !this._sortInc;
            } else {
                $('button#' + this._sortKey).find('i').removeClass().addClass('fas fa-sort');
                this._sortKey = curSortKey;
                this._sortInc = true;
            }
            if (this._sortInc) {
                iconElem.addClass('fas fa-sort-up');
            } else {
                iconElem.addClass('fas fa-sort-down');
            }
            this.getAllItems(this._sortKey, this._sortInc);
        });
    }

    rebindClickEvent() {
        
    }

    getAllItems(sortKey, sortInc) {
        if (sortKey == null) {
            sortKey = 'timestamp'
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
                if (sortInc) {
                    if (a[sortKey] < b[sortKey]) {
                        return -1;
                    } else if (a[sortKey] > b[sortKey]) {
                        return 1;
                    } else {
                        return 0;
                    }
                } else {
                    if (a[sortKey] < b[sortKey]) {
                        return 1;
                    } else if (a[sortKey] > b[sortKey]) {
                        return -1;
                    } else {
                        return 0;
                    }
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

            $('td>button').on('click', event => {
                let eventBtn = $(event.target);
                let delCode = eventBtn.attr('id');
                if (!delCode) {
                    eventBtn = eventBtn.closest('button');
                    delCode = eventBtn.attr('id');
                }

                chrome.storage.local.remove(delCode, () => {
                    eventBtn.closest('tr').remove();
                });
            });
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