'use strict';

import Dexie from './vendor/dexie.js';

const DB_NAME = 'AimeeToolDB';

const SCHEMA_LOCAL = {
    goods: '&code, imagepath, brand, name, origprice, saleprice, localstock, globalstock, memo'
},


/**
 * Class Storage
 */
export default class Storage {
    constructor() {

    }

    get local() {
        if (!this._local) {
            let db = this._local = new Dexie(DB_NAME);
            db.version(1).stores(SCHEMA_LOCAL);
        }
        return this._local;
    }

    async drop() {
        if (await Dexie.exists(DB_NAME)) {
            try {
                await Dexie.delete(DB_NAME);
            } catch (e) {
                return false;
            }
        }
        return true;
    }
}