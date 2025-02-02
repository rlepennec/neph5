import { NephilimItemSheet } from "../../../module/item/base.js";

export class CapaciteSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 560,
            height: 500,
            classes: ["nephilim", "sheet", "item"]
        });
    }

    /** 
     * @override
     */
    get template() {
        return `systems/neph5e/feature/periode/item/capacite.html`;
    }

}