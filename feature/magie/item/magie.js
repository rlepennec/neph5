import { NephilimItemSheet } from "../../../module/item/base.js";

export class MagieSheet extends NephilimItemSheet {

    /** 
     * @override
     */
	static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 700,
            height: 400,
            classes: ["nephilim", "sheet", "item"]
      });
    }

    /** 
     * @override
     */
    get template() {
        return `systems/neph5e/feature/magie/item/magie.html`;
    }

}