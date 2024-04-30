import { NephilimItemSheet } from "../../../module/item/base.js";

export class AlchimieSheet extends NephilimItemSheet {

    /** 
     * @override
     */
	static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 560,
            height: 400,
            classes: ["nephilim", "sheet", "item"]
      });
    }

    /** 
     * @override
     */
    get template() {
        return `systems/neph5e/feature/alchimie/item/alchimie.html`;
    }

}