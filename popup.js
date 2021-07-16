// popup.js

const URL_EXPLORER = chrome.runtime.getURL('explorer.html');

/**
 * Class PopupMenu
 */
class PopupMenu {
    constructor(selector) {
        this.element = document.querySelector(selector);
    }

    clickExplorer(event) {
        window.open(URL_EXPLORER);
    }

    getItem(name) {
        return this.element.querySelector(`[name="${name}"]`);
    }

    disable(name) {
        this.getItem(name).setAttribute('disabled');
    }

    enable(name) {
        this.getItem(name).removeAttribute('disabled');
    }

    static async render() {
        let menu = new PopupMenu('.menu');

        menu.enable('Explorer');

        $('.menu').on('click', '.menu-item', event => {
            if (event.currentTarget.hasAttribute('disbaled')) return false;
            let handle = menu['click' + event.currentTarget.getAttribute('name')];
            if (!handle) return false;
            handle.apply(menu, event);
            window.close();
        });
    }
}

PopupMenu.render();
