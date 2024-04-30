import { NephilimItemSheet } from "../../../module/item/base.js";

export class RituelSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getOriginalData() {
        return {
            cercles: super.cerclesOf('epee')
        }
    }

    /** 
     * @override
     */
	static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 560,
            height: 600,
            classes: ["nephilim", "sheet", "item"],
            resizable: true,
            scrollY: [".tab.description"],
            tabs: [{navSelector: ".sheet-navigation", contentSelector: ".article-body", initial: "description"}]
      });
    }

    /** 
     * @override
     */
    get template() {
        return `systems/neph5e/feature/epee/item/rituel.html`;
    }

}