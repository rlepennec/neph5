import { NephilimItemSheet } from "../../../module/item/base.js";
import { Science } from "../../science/science.js";

export class RituelSheet extends NephilimItemSheet {

    /** 
     * @override
     */
    getData() {
        const data = super.getData();
        data.cercles = Science.cerclesOf('rituel');
        return data;
    }

    /** 
     * @override
     */
	static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
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