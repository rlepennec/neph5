import { NephilimItemSheet } from "./base.js";

export class CatalyseurSheet extends NephilimItemSheet {

    /** 
     * @override
     */
     getData() {
        const data = super.getData();
        data.debug = game.settings.get('neph5e', 'debug');
        return data;
    }

    /** 
     * @override
     */
     static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 560,
            height: 500,
            classes: ["nephilim", "sheet", "item"]
        });
    }

}